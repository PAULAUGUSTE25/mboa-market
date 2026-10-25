import { useState, useRef, useEffect } from 'react';
import httpClient from '@/api/client';
import { isAxiosError } from 'axios';
import { X, Send, Sparkles, Bot, Mic, MicOff, Volume2, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { multiAI } from '@/services/multiAI';
import { voiceAssistant } from '@/services/voiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';
import { useDomain } from '@/contexts/DomainContext';
import { getDomainColors } from '@/utils/colors';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatAssistantText } from '@/utils/formatAssistantText';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isVoice?: boolean;
}

async function convertAudioToWav(audio: Blob): Promise<{ file: Blob; rms: number; peak: number }> {
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error('Audio conversion is not supported in this browser.');
  }

  const context = new AudioContextConstructor();
  try {
    const source = await context.decodeAudioData(await audio.arrayBuffer());
    const targetSampleRate = 16_000;
    const sampleCount = Math.ceil(source.length * targetSampleRate / source.sampleRate);
    const dataSize = sampleCount * 2;
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);
    const writeText = (offset: number, text: string) => {
      for (let i = 0; i < text.length; i++) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    };

    writeText(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeText(8, 'WAVE');
    writeText(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, 'data');
    view.setUint32(40, dataSize, true);

    const output = new DataView(wavBuffer, 44);
    const channelData = Array.from(
      { length: source.numberOfChannels },
      (_, channel) => source.getChannelData(channel)
    );
    const ratio = source.sampleRate / targetSampleRate;
    let sumSquares = 0;
    let peak = 0;

    for (let i = 0; i < sampleCount; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.min(source.length, Math.max(start + 1, Math.floor((i + 1) * ratio)));
      let sum = 0;
      let count = 0;
      for (const channel of channelData) {
        for (let sample = start; sample < end; sample++) {
          sum += channel[sample];
          count++;
        }
      }
      const value = Math.max(-1, Math.min(1, sum / count));
      sumSquares += value * value;
      peak = Math.max(peak, Math.abs(value));
      output.setInt16(i * 2, value < 0 ? value * 0x8000 : value * 0x7fff, true);
    }

    return {
      file: new Blob([wavBuffer], { type: 'audio/wav' }),
      rms: Math.sqrt(sumSquares / sampleCount),
      peak,
    };
  } finally {
    await context.close();
  }
}

export default function AIAssistant() {
  const { theme } = useTheme();
  const { selectedDomain } = useDomain();
  const { user } = useAuthStore();
  const { t, lang } = useLanguage();
  const domainColors = getDomainColors(selectedDomain);

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceTranscript, setIsVoiceTranscript] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPreviewUrlRef = useRef<string | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);
  const sendMessageRef = useRef<(customPrompt?: string) => Promise<void>>(async () => {});
  const [conversationId, setConversationId] = useState<string | null>(null);

  const getWelcomeMessage = () => {
    const displayName = (user?.profile as any)?.display_name;
    if (user) {
      return t(
        `Bonjour ${displayName} ! Je suis Bigiss, votre assistant vocal et agricole MBOA Market. Posez-moi des questions à l'écrit ou par note vocale 🎙️.`,
        `Hello ${displayName}! I am Bigiss, your MBOA Market voice & farm assistant. Ask me questions by typing or using voice notes 🎙️.`
      );
    }
    // Anonymous visitor — no invented name
    return t(
      `Bonjour ! Je suis Bigiss, votre assistant vocal et agricole MBOA Market. Posez-moi des questions à l'écrit ou par note vocale 🎙️.`,
      `Hello! I am Bigiss, your MBOA Market voice & farm assistant. Ask me questions by typing or using voice notes 🎙️.`
    );
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: getWelcomeMessage(),
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const clearAudioPreview = () => {
    if (audioPreviewUrlRef.current) {
      URL.revokeObjectURL(audioPreviewUrlRef.current);
      audioPreviewUrlRef.current = null;
    }
    setAudioPreviewUrl(null);
  };

  // Stop an active response stream while preserving the text already received.
  const stopTypingOrSkip = () => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    setTypingMessageId(null);
    setIsLoading(false);
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Reset conversation and context when user logs in, switches account, or logs out
  useEffect(() => {
    stopTypingOrSkip();
    setMessages([
      {
        id: `welcome-${user?.id || 'anon'}-${Date.now()}`,
        text: getWelcomeMessage(),
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
    setInputText('');
    setIsVoiceTranscript(false);
    setRecordingError('');
    clearAudioPreview();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, [user?.id]);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isRecording]);

  // Clean up speech synthesis, streaming, audio preview and recording on unmount.
  useEffect(() => {
    return () => {
      streamControllerRef.current?.abort();
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch {}
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioPreviewUrlRef.current) {
        URL.revokeObjectURL(audioPreviewUrlRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const resetConversation = () => {
    if (mediaRecorderRef.current) {
      stopRecording(true);
    }
    stopTypingOrSkip();
    setMessages([
      {
        id: `welcome-${user?.id || 'anon'}-${Date.now()}`,
        text: getWelcomeMessage(),
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    setInputText('');
    setIsVoiceTranscript(false);
    setRecordingError('');
    clearAudioPreview();
  };

  const handleClose = () => {
    stopTypingOrSkip();
    if (mediaRecorderRef.current) {
      stopRecording(true);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setIsOpen(false);
  };

  // Toggle Voice Note Recording (Speech-to-Text)
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError(t(
        "L'enregistrement audio n'est pas pris en charge par ce navigateur.",
        "Audio recording is not supported by this browser."
      ));
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      clearAudioPreview();
      discardRecordingRef.current = false;
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setInputText('');
      setIsVoiceTranscript(false);
      setRecordingError('');

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        discardRecordingRef.current = true;
        setRecordingError(t(
          "Une erreur est survenue pendant l'enregistrement. Vérifiez le microphone puis réessayez.",
          "An error occurred while recording. Check your microphone and try again."
        ));
        stopRecording(true);
      };
      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setIsRecording(false);

        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          return;
        }

        const audio = new Blob(chunks, {
          type: recorder.mimeType || chunks[0]?.type || 'audio/webm',
        });
        if (!audio.size) {
          setRecordingError(t(
            "Aucun son n'a été enregistré. Réessayez en parlant après le démarrage.",
            "No audio was recorded. Try speaking after recording starts."
          ));
          return;
        }

        const previewUrl = URL.createObjectURL(audio);
        audioPreviewUrlRef.current = previewUrl;
        setAudioPreviewUrl(previewUrl);
        setIsTranscribing(true);
        setRecordingError('');
        try {
          let audioToUpload = audio;
          let filename = 'bigis-voice.webm';
          try {
            const convertedAudio = await convertAudioToWav(audio);
            if (convertedAudio.rms < 0.0037 && convertedAudio.peak < 0.015) {
              setRecordingError(t(
                "Aucune parole n'a été détectée. Vérifiez le microphone puis réessayez.",
                "No speech was detected. Check your microphone and try again."
              ));
              return;
            }
            audioToUpload = convertedAudio.file;
            filename = 'bigis-voice.wav';
          } catch (conversionError) {
            const supportedTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac'];
            const mimeType = audio.type.split(';', 1)[0].trim().toLowerCase();
            if (!supportedTypes.includes(mimeType)) {
              throw conversionError;
            }
          }

          const form = new FormData();
          form.append('file', audioToUpload, filename);
          const response = await httpClient.post<{ text: string }>('/ai/transcribe_audio', form);
          const transcript = response.data.text.trim();
          if (!transcript) {
            setRecordingError(t(
              "Je n'ai pas pu reconnaître les paroles. Réessayez en parlant plus clairement.",
              "I couldn't recognize the speech. Try again and speak more clearly."
            ));
            return;
          }
          setInputText(transcript);
          setIsVoiceTranscript(true);
          await sendMessageRef.current(transcript);
        } catch (error) {
          const detail = isAxiosError<{ detail?: string }>(error)
            ? error.response?.data?.detail
            : undefined;
          const processingError = !isAxiosError(error) && error instanceof Error
            ? error.message
            : '';
          setRecordingError(detail || (processingError
            ? t(
                `Impossible de préparer l'enregistrement audio : ${processingError}`,
                `Unable to prepare the audio recording: ${processingError}`
              )
            : t(
                "La transcription a échoué. Vérifiez votre connexion puis réessayez.",
                "Transcription failed. Check your connection and try again."
              )));
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      recordingTimeoutRef.current = setTimeout(() => {
        setRecordingError(t(
          "Durée maximale atteinte. Transcription de votre enregistrement…",
          "Maximum recording time reached. Transcribing your recording…"
        ));
        stopRecording();
      }, 30_000);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      mediaStreamRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setRecordingError(t(
          "L'accès au microphone est refusé. Autorisez-le dans les paramètres du navigateur puis réessayez.",
          "Microphone access was denied. Allow it in your browser settings and try again."
        ));
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setRecordingError(t(
          "Aucun microphone n'a été détecté sur cet appareil.",
          "No microphone was detected on this device."
        ));
      } else {
        setRecordingError(t(
          "Impossible de démarrer l'enregistrement. Vérifiez l'accès au microphone puis réessayez.",
          "Could not start recording. Check microphone access and try again."
        ));
      }
    }
  };

  const stopRecording = (discard = false) => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (discard) {
      discardRecordingRef.current = true;
    }
    setIsRecording(false);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
      }
    } else {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend) return;

    // Flush any ongoing typewriter before sending
    stopTypingOrSkip();

    if (mediaRecorderRef.current) {
      stopRecording(true);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      isVoice: isVoiceTranscript,
    };

    const aiMessageId = `ai-${Date.now() + 1}`;
    const pendingAiMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, pendingAiMessage]);
    setInputText('');
    setIsVoiceTranscript(false);
    setRecordingError('');
    clearAudioPreview();
    setIsLoading(true);
    setTypingMessageId(aiMessageId);
    const controller = new AbortController();
    streamControllerRef.current = controller;

    try {
      // Only use real display_name if user is authenticated — never invent a name
      const displayName = user?.profile?.display_name || undefined;
      // Persist user message to backend conversation storage (only if authenticated)
      if (displayName) {
        try {
          const saveRes = await httpClient.post('/ai/save_message', null, { params: { conversation_id: conversationId, sender_name: displayName, content: textToSend } });
          if (saveRes?.data?.conversation_id) setConversationId(saveRes.data.conversation_id);
        } catch (e) {
          console.warn('Failed to persist user message:', e);
        }
      }
      // Build context: only last 4 non-empty messages to limit token usage
      const recentHistory = messages
        .filter((m) => m.text)
        .slice(-4)
        .map((m) => `${m.sender === 'user' ? (displayName ? displayName : t('Utilisateur', 'User')) : 'Bigiss'}: ${m.text}`)
        .join('\n')
        .slice(-2000);
      const context = messages.length > 1 ? recentHistory : undefined;

      await multiAI.streamResponse(
        textToSend,
        context,
        (partialText) => {
          setMessages((previous) => previous.map((message) =>
            message.id === aiMessageId ? { ...message, text: partialText } : message
          ));
        },
        controller.signal,
      );
      setTypingMessageId(null);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Error getting AI response:', error);
      setIsLoading(false);
      setTypingMessageId(null);
      const errorText = t("Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.", 'Sorry, I encountered an error. Please try again later.');
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMessageId ? { ...m, text: errorText } : m))
      );
    } finally {
      if (streamControllerRef.current === controller) {
        streamControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };
  sendMessageRef.current = handleSendMessage;

  // Text-to-speech read out loud
  const speakText = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSpeakingMessageId(msgId);
    voiceAssistant.updateConfig({ language: lang === 'fr' ? 'fr' : 'en' });
    voiceAssistant.speak(text);

    // Monitor speaking state
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeakingMessageId(null);
        clearInterval(checkSpeaking);
      }
    }, 500);
  };

  const quickPrompts = [
    { label: '🌾 Prix du Maïs', prompt: 'Quels sont les prix actuels du maïs au Cameroun ?' },
    { label: '🐔 Élevage Poulets', prompt: "Comment démarrer un élevage de poulets de chair ?" },
    { label: '🍅 Maladie Tomates', prompt: 'Comment traiter le mildiou sur les tomates ?' },
    { label: '🌧️ Météo Semis', prompt: 'Quelle est la meilleure période pour semer les céréales ?' },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 font-['Inter','Plus_Jakarta_Sans',sans-serif] lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[420px] h-[min(520px,calc(100dvh-10rem))] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 flex flex-col"
            style={{
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
            }}
          >
            {/* Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-white/10" style={{ background: domainColors.gradient }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Bigis</h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetConversation}
                  title={t('Réinitialiser la discussion', 'Reset chat')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-white text-xs font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('Réinitialiser', 'Reset')}</span>
                </button>
                <button
                  onClick={handleClose}
                  aria-label={t('Fermer Bigis', 'Close Bigis')}
                  title={t('Fermer', 'Close')}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-black/5 dark:bg-white/5 border-b border-white/10 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  disabled={isRecording || isTranscribing || isLoading}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all border text-[11px] font-medium ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                      : 'bg-white hover:bg-emerald-50 text-gray-700 border-gray-200 shadow-sm'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar"
            >
              {messages.map((msg) => {
                const isCurrentTyping = msg.id === typingMessageId;
                const isThinking = isCurrentTyping && !msg.text;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm relative group transition-all ${
                        msg.sender === 'user'
                          ? 'text-white rounded-br-none shadow-md'
                          : theme === 'dark'
                            ? 'bg-white/10 text-white rounded-bl-none border border-white/10 shadow-sm'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                      }`}
                      style={msg.sender === 'user' ? { backgroundColor: domainColors.primary } : undefined}
                    >
                      {msg.isVoice && (
                        <div className="flex items-center gap-1 text-[11px] font-medium opacity-80 mb-1">
                          <Mic className="w-3 h-3 text-emerald-300" />
                          <span>{t('Note vocale', 'Voice note')}</span>
                        </div>
                      )}

                      {/* Content or Thinking state */}
                      {isThinking ? (
                        <div className="flex items-center gap-2 py-1 px-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
                            {t('Bigiss prépare votre réponse...', 'Bigiss is crafting your answer...')}
                          </span>
                        </div>
                      ) : (
                        <div className="leading-relaxed whitespace-pre-wrap">
                          {msg.sender === 'ai' ? formatAssistantText(msg.text) : msg.text}
                          {isCurrentTyping && (
                            <span
                              className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 rounded-sm animate-pulse shadow-sm"
                              style={{ verticalAlign: 'text-bottom' }}
                            />
                          )}
                        </div>
                      )}

                      {/* Footer: timestamp / actions */}
                      {!isThinking && (
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-70">
                          <span>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender === 'ai' && (
                            <div className="flex items-center gap-2">
                              {isCurrentTyping ? (
                                <button
                                  type="button"
                                  onClick={stopTypingOrSkip}
                                  className="text-emerald-500 hover:underline font-semibold"
                                >
                                  {t('Afficher tout', 'Show all')}
                                </button>
                              ) : (
                                <button
                                  onClick={() => speakText(msg.id, msg.text)}
                                  className="flex items-center gap-1 hover:opacity-100 transition-opacity p-0.5 rounded text-emerald-400 font-medium"
                                  title={t('Écouter le message', 'Listen to message')}
                                >
                                  {speakingMessageId === msg.id ? (
                                    <>
                                      <Square className="w-3 h-3 text-red-400 animate-pulse" />
                                      <span className="text-red-400">{t('Arrêter', 'Stop')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span>{t('Écouter', 'Listen')}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Recording Indicator */}
              {(isRecording || isTranscribing) && (
                <div className="flex justify-center my-2">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium animate-pulse shadow-lg">
                    {isRecording ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <span>{t('Enregistrement vocal… appuyez sur le micro pour terminer', 'Recording… tap the microphone to finish')}</span>
                      </>
                    ) : (
                      <span>{t('Bigis transcrit votre message…', 'Bigis is transcribing your message…')}</span>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
              {audioPreviewUrl && (
                <div className="mb-2 flex items-center gap-2">
                  <audio className="min-w-0 flex-1 h-9" controls src={audioPreviewUrl}>
                    {t('Votre navigateur ne peut pas lire cet enregistrement.', 'Your browser cannot play this recording.')}
                  </audio>
                  <button
                    type="button"
                    onClick={() => {
                      clearAudioPreview();
                      setInputText('');
                      setIsVoiceTranscript(false);
                    }}
                    disabled={isTranscribing || isLoading}
                    aria-label={t('Supprimer l’enregistrement vocal', 'Delete voice recording')}
                    title={t('Supprimer et recommencer', 'Delete and record again')}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  aria-pressed={isRecording}
                  title={isRecording ? t('Arrêter la note vocale', 'Stop voice note') : t('Enregistrer une note vocale', 'Record voice note')}
                  className={`p-2.5 rounded-xl transition-all shadow-md ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                      : theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isRecording
                      ? t('Parlez maintenant...', 'Speak now...')
                      : isTranscribing
                        ? t('Transcription en cours...', 'Transcribing...')
                      : t('Posez votre question ou note vocale...', 'Ask a question or voice note...')
                  }
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white placeholder-white/40 border border-white/10'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-inner'
                  }`}
                />

                {isLoading || typingMessageId ? (
                  <button
                    type="button"
                    onClick={stopTypingOrSkip}
                    title={t('Arrêter la génération', 'Stop generating')}
                    className="p-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center group"
                  >
                    <Square className="w-4 h-4 fill-current group-hover:scale-90 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isRecording || isTranscribing}
                    className="p-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: domainColors.primary }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </form>
              {recordingError && (
                <p role="alert" className="mt-2 px-1 text-xs text-red-600 dark:text-red-300">
                  {recordingError}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bigiss AI Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:shadow-emerald-500/40 transition-all border-2 border-white/30 backdrop-blur-md relative group"
        style={{ background: domainColors.gradientDiagonal }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <Mic className="w-2.5 h-2.5 text-gray-900" />
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
