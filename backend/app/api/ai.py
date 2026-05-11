import asyncio
import json
import urllib.error
import urllib.request
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI"])

GEMINI_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]


class AIChatRequest(BaseModel):
    prompt: str
    context: Optional[str] = None


class AIChatResponse(BaseModel):
    text: str
    provider: str = "Gemini"


def _build_prompt(prompt: str, context: Optional[str]) -> str:
    base = (
        "Tu es Bigiss, l'assistant IA de MBOA Market, une plateforme agricole du Cameroun. "
        "Réponds en français de manière utile, concise et professionnelle."
    )
    if context:
        return f"{base}\n\nContexte: {context}\n\nQuestion: {prompt}"
    return f"{base}\n\nQuestion: {prompt}"


def _call_gemini_model(prompt: str, model: str) -> str:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 700},
    }
    req = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))

    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("Gemini response has no candidates")

    parts = (candidates[0].get("content") or {}).get("parts") or []
    if not parts or not parts[0].get("text"):
        raise ValueError("Gemini response has no text")

    return parts[0]["text"]


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(payload: AIChatRequest):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY manquante côté serveur. Configurez la variable d'environnement.",
        )

    full_prompt = _build_prompt(payload.prompt, payload.context)
    last_error = None

    for model in GEMINI_MODELS:
        if not model:
            continue
        try:
            text = await asyncio.to_thread(_call_gemini_model, full_prompt, model)
            return AIChatResponse(text=text, provider=f"Gemini ({model})")
        except (urllib.error.HTTPError, urllib.error.URLError, ValueError, TimeoutError) as exc:
            last_error = exc
            continue

    raise HTTPException(
        status_code=502,
        detail=f"Échec des appels Gemini. Détail: {str(last_error)[:300]}",
    )

