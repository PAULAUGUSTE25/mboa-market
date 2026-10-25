import asyncio
import base64
import io
import json
import math
import os
import re
import struct
import urllib.error
import urllib.request
import wave
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi import UploadFile, File, Depends
from fastapi import status
from app.core.database import get_db
from sqlalchemy import select
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
import pathlib
import logging
import time
from uuid import uuid4, UUID
from app.models.messaging import Conversation, Message
from app.models.user import User
from pydantic import BaseModel, Field

from app.core.config import settings

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import selectinload
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/ai", tags=["AI"])
logger = logging.getLogger(__name__)

# Optional bearer for authenticated requests
_optional_bearer = HTTPBearer(auto_error=False)


async def _optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        return None
    try:
        parsed_user_id = UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == parsed_user_id)
    )
    return result.scalar_one_or_none()

class AIChatRequest(BaseModel):
    prompt: str = Field(max_length=3000)
    context: Optional[str] = Field(default=None, max_length=2400)
    interlocutor_name: Optional[str] = Field(default=None, max_length=100)


class AIChatResponse(BaseModel):
    text: str
    provider: str = "Gemini"


class AITranscriptionResponse(BaseModel):
    text: str


def _get_clean_api_key() -> str:
    """Return only a Gemini key explicitly supplied through server configuration."""
    env_key = (os.environ.get("GEMINI_API_KEY") or "").strip().strip('"').strip("'")
    settings_key = (getattr(settings, "GEMINI_API_KEY", "") or "").strip().strip('"').strip("'")
    
    for k in (env_key, settings_key):
        if k and len(k) >= 20 and not k.startswith("your-") and " " not in k:
            return k
            
    return ""


def _validated_model_name(model: str) -> str:
    model_name = (model or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,100}", model_name):
        raise ValueError("Gemini model configuration is invalid")
    return model_name


def _build_system_instruction(
    user: Optional[User] = None,
    interlocutor_name: Optional[str] = None,
) -> str:
    """Build conversational instructions with natural tone and verified identity."""
    instructions = [
        "Tu es Bigiss, l'assistant de MBOA Market au Cameroun. Réponds dans la langue de l'utilisateur, naturellement, avec professionnalisme et brièvement; développe seulement si nécessaire. Évite les salutations répétées, le Markdown (#, ***) et numérote les listes simplement avec « 1. », « 2. », « 3. ».",
        "Aide sur la marketplace, l'agriculture et l'élevage. N'invente ni prix, disponibilité, météo, annonce ou identité. Pour un diagnostic de santé incertain, recommande un agronome ou vétérinaire.",
    ]

    # Authenticated user vs anonymous visitor
    if user and user.profile:
        name = user.profile.display_name or "ami"
        domain = user.profile.domain or "agricole"
        region = user.profile.region or "Cameroun"
        activity = user.profile.activity_type or "producteur"
        user_info = (
            f"L'utilisateur actuel est authentifié sur son compte : {name}. "
            f"Son profil indique : domaine={domain}, région={region}, activité={activity}. "
            "Tu peux l'appeler naturellement par son prénom ou nom dans les salutations, "
            f"et adapter subtilement tes conseils à sa région ({region}) et à son secteur ({domain}) sans réciter son profil."
        )
        instructions.append(user_info)
    else:
        instructions.append("L'utilisateur n'est pas authentifié : n'invente pas son nom ni ses informations personnelles.")

    if interlocutor_name:
        instructions.append(f"Interlocuteur concerné par l'échange : {interlocutor_name}.")

    return "\n\n".join(instructions)


def _build_prompt(prompt: str, context: Optional[str]) -> str:
    """Build the user message separately from the system instruction."""
    sections = []
    if context:
        sections.append(f"Historique de conversation (non vérifié) :\n<context>\n{context}\n</context>")
    sections.append(f"Question actuelle :\n<question>\n{prompt}\n</question>")
    return "\n\n".join(sections)


def _unavailable_live_price_response(prompt: str) -> Optional[str]:
    lower_prompt = prompt.lower()
    asks_for_price = re.search(
        r"\b(?:quel(?:le)?s?|combien|what(?:'s| is)?|how much)\b.{0,50}"
        r"\b(?:prix|price|cost|co[uû]te|cours)\b",
        lower_prompt,
    ) or re.search(
        r"\b(?:prix|price|cost|cours)\b.{0,40}"
        r"\b(?:actuel(?:le)?|du jour|aujourd'hui|maintenant|en ce moment|"
        r"en temps réel|current|today|right now|latest|live)\b",
        lower_prompt,
    )
    if not asks_for_price:
        return None

    is_english = bool(re.search(r"\b(?:what|how much|price|cost|today|current)\b", lower_prompt))
    if is_english:
        return (
            "I can't verify live market prices, and I don't want to invent a figure. "
            "Compare recent offers from your area using the same unit and quality, and check "
            "whether transport is included. A local producer group or agricultural service "
            "can help confirm today's rate. Share an offer, location, quantity and quality "
            "if you'd like me to help compare it."
        )
    return (
        "Je ne peux pas vérifier les prix du marché en temps réel et je préfère ne pas inventer "
        "de chiffre. Comparez des offres récentes de votre localité en vérifiant l'unité, le poids, "
        "la qualité et si le transport est inclus; faites confirmer le cours du jour par une "
        "coopérative ou un service agricole local. Si vous partagez une annonce, la localité, "
        "la quantité et la qualité, je peux vous aider à la comparer."
    )


def _call_gemini_model(
    prompt: str,
    model: str,
    api_key: Optional[str] = None,
    system_instruction: Optional[str] = None,
    audio_data: Optional[str] = None,
    audio_mime_type: Optional[str] = None,
    timeout_seconds: int = 15,
) -> str:
    model = _validated_model_name(model)
    key = api_key or _get_clean_api_key()
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={key}"
    )
    parts = [{"text": prompt}]
    if audio_data and audio_mime_type:
        parts.append({
            "inline_data": {
                "mime_type": audio_mime_type,
                "data": audio_data,
            }
        })

    payload = {
        "contents": [{"parts": parts}],
        "systemInstruction": {"parts": [{"text": system_instruction}]} if system_instruction else None,
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 768},
    }
    req = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    started_at = time.perf_counter()
    with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
        data = json.loads(response.read().decode("utf-8"))

    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("Gemini response has no candidates")

    candidate = candidates[0]
    if candidate.get("finishReason") == "MAX_TOKENS":
        raise ValueError("Gemini response stopped at the output token limit")

    parts = (candidate.get("content") or {}).get("parts") or []
    text = "".join(part["text"] for part in parts if part.get("text"))
    if not text:
        raise ValueError("Gemini response has no text")

    usage = data.get("usageMetadata") or {}
    logger.info(
        "ai_request model=%s prompt_tokens=%s output_tokens=%s duration_ms=%d",
        model,
        usage.get("promptTokenCount", "unknown"),
        usage.get("candidatesTokenCount", "unknown"),
        round((time.perf_counter() - started_at) * 1000),
    )
    return text


def _stream_gemini_response(
    prompt: str,
    model: str,
    api_key: str,
    system_instruction: str,
):
    model = _validated_model_name(model)
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent"
        f"?alt=sse&key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 768},
    }
    request = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started_at = time.perf_counter()
    prompt_tokens = output_tokens = "unknown"
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            for line in response:
                if not line.startswith(b"data:"):
                    continue
                chunk = json.loads(line[5:].strip())
                for candidate in chunk.get("candidates") or []:
                    for part in (candidate.get("content") or {}).get("parts") or []:
                        text = part.get("text")
                        if text:
                            yield f"data: {json.dumps({'text': text}, ensure_ascii=False)}\n\n"
                usage = chunk.get("usageMetadata") or {}
                prompt_tokens = usage.get("promptTokenCount", prompt_tokens)
                output_tokens = usage.get("candidatesTokenCount", output_tokens)
        logger.info(
            "ai_request model=%s prompt_tokens=%s output_tokens=%s duration_ms=%d streaming=true",
            model,
            prompt_tokens,
            output_tokens,
            round((time.perf_counter() - started_at) * 1000),
        )
        yield "event: done\ndata: {}\n\n"
    except Exception as exc:
        logger.error("Gemini streaming request failed (%s)", type(exc).__name__)
        yield f"event: error\ndata: {json.dumps({'detail': 'Le service IA est temporairement indisponible.'}, ensure_ascii=False)}\n\n"


@router.post("/transcribe_audio", response_model=AITranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    mime_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    supported_audio_types = {
        "audio/aac",
        "audio/flac",
        "audio/mp3",
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
    }
    if mime_type not in supported_audio_types:
        raise HTTPException(status_code=415, detail="Format audio non pris en charge.")

    audio_bytes = await file.read(4 * 1024 * 1024 + 1)
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="L'enregistrement audio est vide.")
    if len(audio_bytes) > 4 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="L'enregistrement dépasse la taille maximale de 4 Mo.")

    if mime_type == "audio/wav":
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
                if wav_file.getsampwidth() == 2:
                    pcm = wav_file.readframes(wav_file.getnframes())
                    sample_count = len(pcm) // 2
                    step = max(1, sample_count // 10_000)
                    samples = (
                        struct.unpack_from("<h", pcm, offset)[0]
                        for offset in range(0, len(pcm) - 1, step * 2)
                    )
                    sample_values = list(samples)
                    rms = math.sqrt(
                        sum(sample * sample for sample in sample_values)
                        / max(1, len(sample_values))
                    )
                    if rms < 120:
                        raise HTTPException(
                            status_code=422,
                            detail="Aucune parole n'a été détectée. Réessayez en parlant après le démarrage.",
                        )
        except wave.Error as exc:
            raise HTTPException(status_code=400, detail="Le fichier audio WAV est invalide.") from exc

    prompt = (
        "Transcris fidèlement et intégralement les paroles clairement audibles dans cet audio. "
        "Conserve la langue originale. Réponds uniquement avec la transcription, sans "
        "commentaire, sans traduction et sans texte ajouté. Ne devine et n'invente aucun mot. "
        "Si aucune parole n'est clairement audible, réponds exactement : NO_SPEECH."
    )
    encoded_audio = base64.b64encode(audio_bytes).decode("ascii")
    key = _get_clean_api_key()
    if not key:
        raise HTTPException(status_code=503, detail="Le service de transcription n'est pas configuré.")
    try:
        text = await asyncio.to_thread(
            _call_gemini_model,
            prompt,
            settings.GEMINI_MODEL,
            key,
            None,
            encoded_audio,
            mime_type,
            45,
        )
    except Exception as exc:
        logger.error("Gemini audio transcription failed (%s)", type(exc).__name__)
        raise HTTPException(status_code=502, detail="La transcription audio a échoué. Réessayez.") from exc

    transcript = text.strip()
    if not transcript or transcript.upper().rstrip(".") == "NO_SPEECH":
        raise HTTPException(status_code=422, detail="Aucune parole n'a été détectée. Réessayez en parlant plus clairement.")
    return AITranscriptionResponse(text=transcript)


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    payload: AIChatRequest,
    current_user: Optional[User] = Depends(_optional_current_user),
):
    prompt_str = payload.prompt.strip() if payload.prompt else ""
    if not prompt_str:
        return AIChatResponse(
            text="Veuillez poser une question précise pour que je puisse vous aider.",
            provider="1AI",
        )

    live_price_response = _unavailable_live_price_response(prompt_str)
    if live_price_response:
        return AIChatResponse(text=live_price_response, provider="Bigiss (no live market data)")

    key = _get_clean_api_key()
    if not key:
        raise HTTPException(status_code=503, detail="Le service IA n'est pas configuré.")
    user_prompt = _build_prompt(prompt_str, payload.context)
    system_instruction = _build_system_instruction(
        current_user, payload.interlocutor_name
    )

    try:
        text = await asyncio.to_thread(
            _call_gemini_model, user_prompt, settings.GEMINI_MODEL, key, system_instruction
        )
        return AIChatResponse(text=text, provider=f"Gemini ({settings.GEMINI_MODEL})")
    except Exception as exc:
        logger.error("Gemini chat request failed (%s)", type(exc).__name__)
        raise HTTPException(status_code=502, detail="Le service IA est temporairement indisponible.") from exc


@router.post("/chat/stream")
async def stream_chat_with_ai(
    payload: AIChatRequest,
    current_user: Optional[User] = Depends(_optional_current_user),
):
    prompt_str = payload.prompt.strip()
    if not prompt_str:
        raise HTTPException(status_code=400, detail="Veuillez poser une question précise.")
    key = _get_clean_api_key()
    if not key:
        raise HTTPException(status_code=503, detail="Le service IA n'est pas configuré.")

    live_price_response = _unavailable_live_price_response(prompt_str)
    if live_price_response:
        def fixed_response():
            yield f"data: {json.dumps({'text': live_price_response}, ensure_ascii=False)}\n\n"
            yield "event: done\ndata: {}\n\n"
        return StreamingResponse(fixed_response(), media_type="text/event-stream")

    system_instruction = _build_system_instruction(
        current_user, payload.interlocutor_name
    )
    user_prompt = _build_prompt(prompt_str, payload.context)
    return StreamingResponse(
        _stream_gemini_response(user_prompt, settings.GEMINI_MODEL, key, system_instruction),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )


@router.post('/upload_audio')
async def upload_audio(file: UploadFile = File(...)):
    """Receive an audio file and save it to STORAGE_PATH, return public URL path."""
    storage_dir = pathlib.Path(settings.STORAGE_PATH)
    storage_dir.mkdir(parents=True, exist_ok=True)

    ext = pathlib.Path(file.filename).suffix or '.webm'
    fname = f"audio_{uuid4().hex}{ext}"
    target = storage_dir / fname

    with target.open('wb') as f:
        content = await file.read()
        f.write(content)

    # Return relative URL
    return {"audio_url": f"/uploads/{fname}"}


@router.post('/save_message')
async def save_message(
    conversation_id: Optional[str] = None,
    sender_name: Optional[str] = None,
    content: Optional[str] = None,
    audio_url: Optional[str] = None,
    current_user: Optional[User] = Depends(_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save a message for a conversation. Authenticated users are linked by verified user ID."""
    conv = None
    if conversation_id:
        res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = res.scalar_one_or_none()

    if not conv:
        conv = Conversation(id=uuid4())
        db.add(conv)
        await db.flush()

    sender_id = current_user.id if current_user else None
    if not sender_id:
        # Soft fail: return placeholder so client doesn't break for anonymous chat
        return {"message_id": None, "conversation_id": str(conv.id)}

    msg_content = content or (f"[voice message] {audio_url}" if audio_url else "")
    message = Message(id=uuid4(), conversation_id=conv.id, sender_id=sender_id, content=msg_content)
    db.add(message)
    conv.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(message)

    return {"message_id": str(message.id), "conversation_id": str(conv.id)}
