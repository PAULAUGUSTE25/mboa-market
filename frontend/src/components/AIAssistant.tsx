import { useState, useRef, useEffect } from 'react';
import httpClient from '@/api/client';
import { X, Send, Sparkles, Bot, Mic, MicOff, Volume2, VolumeX, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { multiAI } from '@/services/multiAI';
import { voiceAssistant } from '@/services/voiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';
import { useDomain } from '@/contexts/DomainContext';
import { getDomainColors } from '@/utils/colors';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isVoice?: boolean;
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
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [recordingTranscript, setRecordingTranscript] = useState('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<any>(null);
  const activeFullTextRef = useRef<{ id: string; fullText: string; shouldSpeak: boolean } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const getWelcomeMessage = () => {
    const displayName = (user?.profile as any)?.display_name;
    if (displayName) {
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

  // Stop typing and immediately display the full message if requested
  const stopTypingOrSkip = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (activeFullTextRef.current) {
      const { id, fullText, shouldSpeak } = activeFullTextRef.current;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: fullText } : m))
      );
      if (shouldSpeak) {
        speakText(id, fullText);
      }
      activeFullTextRef.current = null;
    }
    setTypingMessageId(null);
    setIsLoading(false);
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Modern progressive typewriter stream
  const startTypewriter = (msgId: string, fullText: string, shouldSpeak: boolean) => {
    activeFullTextRef.current = { id: msgId, fullText, shouldSpeak };
    setTypingMessageId(msgId);
    setIsLoading(false);

    let currentIndex = 0;
    const totalLength = fullText.length;
    // Pacing adapted to message length: short greetings type letter-by-letter;
    // longer answers stream smoothly in small natural tokens
    const baseInterval = totalLength > 600 ? 12 : totalLength > 250 ? 15 : 18;
    const stepSize = totalLength > 600 ? 4 : totalLength > 250 ? 2 : 1;

    const typeNext = () => {
      if (currentIndex < totalLength) {
        currentIndex = Math.min(currentIndex + stepSize, totalLength);
        const currentSlice = fullText.slice(0, currentIndex);

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: currentSlice } : m))
        );

        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }

        // Slight natural human-like cadence pause at punctuation
        const lastChar = currentSlice.slice(-1);
        const pause = (lastChar === '.' || lastChar === '!' || lastChar === '?' || lastChar === '\n') ? 35 : 0;

        typingTimeoutRef.current = setTimeout(typeNext, baseInterval + pause);
      } else {
        // Complete
        setTypingMessageId(null);
        activeFullTextRef.current = null;
        typingTimeoutRef.current = null;
        if (shouldSpeak) {
          speakText(msgId, fullText);
        }
      }
    };

    typeNext();
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
    setRecordingTranscript('');
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

  // Clean up speech synthesis, typewriter and recognition on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const resetConversation = () => {
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
    setRecordingTranscript('');
  };

  const handleClose = () => {
    stopTypingOrSkip();
    if (isRecording) {
      stopRecording();
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

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t("La reconnaissance vocale n'est pas supportée sur ce navigateur.", "Speech recognition is not supported on this browser."));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setRecordingTranscript(currentTranscript);
        setInputText(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;

      // Also start MediaRecorder to capture audio blob for upload
      try {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const mr = new MediaRecorder(stream);
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.onstop = async () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            // upload audio
            try {
              const form = new FormData();
              form.append('file', blob, `recording_${Date.now()}.webm`);
              const res = await httpClient.post('/ai/upload_audio', form, { headers: { 'Content-Type': 'multipart/form-data' } });
              const audio_url = res.data?.audio_url;
              // Save message referencing audio — only if authenticated
              const displayName: string | undefined = (user?.profile as any)?.display_name || undefined;
              const saveRes = displayName
                ? await httpClient.post('/ai/save_message', null, { params: { conversation_id: conversationId, sender_name: displayName, audio_url } })
                : { data: null };
              if (saveRes?.data?.conversation_id) setConversationId(saveRes.data.conversation_id);
            } catch (err) {
              console.error('Audio upload failed', err);
            }
          };
          mr.start();
          mediaRecorderRef.current = mr;
        }).catch((err) => {
          console.error('MediaDevices.getUserMedia error:', err);
        });
      } catch (e) {
        console.error('MediaRecorder init failed', e);
      }
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // stop media recorder
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        // stop all tracks
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (customPrompt?: string, isVoicePrompt = false) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend) return;

    // Flush any ongoing typewriter before sending
    stopTypingOrSkip();

    if (isRecording) {
      stopRecording();
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      isVoice: isVoicePrompt || isRecording,
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
    setRecordingTranscript('');
    setIsLoading(true);
    setTypingMessageId(aiMessageId);

    const shouldSpeak = autoSpeak || isVoicePrompt || isRecording;

    try {
      // Only use real display_name if user is authenticated — never invent a name
      const displayName: string | undefined = (user?.profile as any)?.display_name || undefined;
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
        .map((m) => `${m.sender === 'user' ? (displayName || t('Visiteur', 'Visitor')) : 'Bigiss'}: ${m.text}`)
        .join('\n');
      const context = messages.length > 1 ? recentHistory : undefined;

      const response = await multiAI.generateResponse(
        textToSend,
        context
      );

      // Smooth typewriter streaming animation
      startTypewriter(aiMessageId, response.text, shouldSpeak);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
      setTypingMessageId(null);
      const errorText = t("Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.", 'Sorry, I encountered an error. Please try again later.');
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMessageId ? { ...m, text: errorText } : m))
      );
    }
  };

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
            className="absolute bottom-16 right-0 w-[330px] sm:w-[420px] h-[520px] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 flex flex-col"
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
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm">Bigiss AI</h3>
                    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                      Voice & Farm
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('En ligne • Vocal actif', 'Online • Voice active')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  title={autoSpeak ? t('Lecture vocale automatique activée', 'Auto voice output on') : t('Activer la lecture vocale', 'Turn on auto voice output')}
                  className={`p-1.5 rounded-lg transition-colors text-white ${autoSpeak ? 'bg-white/30' : 'hover:bg-white/15 opacity-70'}`}
                >
                  {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetConversation}
                  title={t('Réinitialiser la discussion', 'Reset chat')}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white opacity-70 hover:opacity-100"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
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
                          {msg.text}
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
              {isRecording && (
                <div className="flex justify-center my-2">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium animate-pulse shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>{t('Enregistrement note vocale...', 'Recording voice note...')}</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
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
                    title={t('Afficher la réponse complète', 'Show full response')}
                    className="p-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center group"
                  >
                    <Square className="w-4 h-4 fill-current group-hover:scale-90 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isRecording}
                    className="p-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: domainColors.primary }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </form>
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
