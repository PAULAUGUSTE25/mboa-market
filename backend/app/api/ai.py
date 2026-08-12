import asyncio
import json
import urllib.error
import urllib.request
import os
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI"])

GEMINI_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
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


def _call_gemini_model(prompt: str, model: str, api_key: Optional[str] = None) -> str:
    key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={key}"
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

    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))

    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("Gemini response has no candidates")

    parts = (candidates[0].get("content") or {}).get("parts") or []
    if not parts or not parts[0].get("text"):
        raise ValueError("Gemini response has no text")

    return parts[0]["text"]


def _generate_fallback_response(prompt: str) -> str:
    lower = prompt.lower()

    if any(w in lower for w in ["maïs", "mais"]):
        return (
            "Pour le maïs au Cameroun : la période de semis recommandée est mars-avril (début des pluies). "
            "Appliquez un engrais NPK 20-10-10 au semis, suivi d'urée à 4 semaines. Rendement attendu : 2 à 4 tonnes/hectare. "
            "Les prix moyens oscillent entre 200 et 350 FCFA/kg selon les régions."
        )
    elif "tomate" in lower:
        return (
            "Pour la culture des tomates : assurez un tuteurage solide et un espacement de 50x80cm. "
            "Traitez préventivement contre le mildiou avec de la bouillie bordelaise ou un fongicide adapté. "
            "Le rendement moyen est de 20 à 35 tonnes/hectare sous irrigation."
        )
    elif "manioc" in lower:
        return (
            "Le manioc est idéal pour les sols camerounais. Plantez les boutures en début de saison des pluies (espacement 1m x 1m). "
            "Cycle de récolte : 9 à 12 mois. Rendement moyen : 15 à 25 tonnes/hectare. "
            "Résistance élevée à la sécheresse."
        )
    elif any(w in lower for w in ["poulet", "volaille", "poule"]):
        return (
            "Élevage de volaille : pour les poulets de chair, prévoyez un cycle de 45 jours avec aliment démarrage (0-2 semaines) "
            "puis finition. Vaccination obligatoire contre Newcastle et Gumboro. Respectez 8 à 10 poulets par m²."
        )
    elif any(w in lower for w in ["porc", "cochon"]):
        return (
            "Élevage porcin : prévoyez 5 à 6 mois pour atteindre un poids de marché de 90-100 kg. "
            "Assurez une hygiène stricte du bâtiment, un déparasitage régulier et une ration équilibrée (maïs + soja + minéraux)."
        )
    elif any(w in lower for w in ["prix", "combien", "coût", "tarif"]):
        return (
            "Les prix des produits agricoles sur MBOA Market dépendent de la saison et de la région (Centre, Littoral, Ouest, etc.). "
            "Je vous recommande d'explorer nos annonces ou de contacter directement les vendeurs pour négocier les meilleurs tarifs de gros."
        )
    elif any(w in lower for w in ["météo", "pluie", "semis", "saison"]):
        return (
            "Au Cameroun, la grande saison des pluies permet des semis optimaux au Sud/Centre (mars à mai et août à octobre). "
            "Dans le Grand Nord, profitez de la saison unique de juin à septembre."
        )
    elif any(w in lower for w in ["bonjour", "salut", "hello"]):
        return (
            "Bonjour ! Je suis Bigiss, votre assistant agricole intelligent sur MBOA Market. "
            "Comment puis-je vous assister aujourd'hui dans vos activités agricoles ou d'élevage ?"
        )
    else:
        return (
            "Je suis Bigiss, votre assistant agricole MBOA Market. Je vous conseille sur la culture du maïs, tomates, manioc, "
            "l'élevage de volailles/porcs, les traitements, la météo des semis et les opportunités de vente au Cameroun."
        )


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(payload: AIChatRequest):
    if not payload.prompt.trim() if hasattr(payload.prompt, "trim") else not payload.prompt.strip():
        return AIChatResponse(
            text="Veuillez poser une question précise pour que je puisse vous aider.",
            provider="Bigiss AI",
        )

    # Check key validity before attempting remote call
    key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not key or len(key) < 20 or key.startswith("AIzaSyDMveMdsMx0sCjOF6sdPNYuxzNe5r7ExYc"):
        # Fallback to local AI engine if API key is empty or dummy placeholder
        return AIChatResponse(
            text=_generate_fallback_response(payload.prompt),
            provider="Bigiss Local AI Engine",
        )

    full_prompt = _build_prompt(payload.prompt, payload.context)

    for model in GEMINI_MODELS:
        if not model:
            continue
        try:
            text = await asyncio.to_thread(_call_gemini_model, full_prompt, model, key)
            return AIChatResponse(text=text, provider=f"Gemini ({model})")
        except urllib.error.HTTPError as exc:
            print(f"⚠️ Gemini model {model} HTTP {exc.code}: {exc.reason}. Trying next model...")
            continue
        except Exception as exc:
            print(f"⚠️ Gemini model {model} error: {exc}. Trying next model...")
            continue

    # Clean fallback if all cloud models fail
    return AIChatResponse(
        text=_generate_fallback_response(payload.prompt),
        provider="Bigiss Local AI Engine (Fallback)",
    )
