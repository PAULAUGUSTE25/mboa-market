from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import auth, users, listings, messaging, orders, security, b2b, livestock, logistics, admin, analytics, ai
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crée les tables DB au démarrage si elles n'existent pas"""
    try:
        from app.core.database import engine, Base
        import app.models  # noqa: F401 – enregistre tous les modèles dans Base.metadata
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Tables DB vérifiées/créées au démarrage")
    except Exception as e:
        logger.error(f"❌ Erreur init DB: {e}")
    yield

app = FastAPI(
    title="MBOA Market API",
    description="Agricultural Marketplace Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware — NE PAS mélanger allow_credentials=True avec allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://mboa-market.netlify.app",
        "https://mboa-backoffice-admin.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(messaging.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(security.router, prefix="/api")
app.include_router(b2b.router, prefix="/api")
app.include_router(livestock.router, prefix="/api")
app.include_router(logistics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "MBOA Market API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "api": "online"}


@app.get("/api/db-status")
async def db_status():
    """Diagnostic: teste la connexion DB"""
    try:
        from app.core.database import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            row = result.scalar()
        return {"db": "connected", "test": row, "url_prefix": str(engine.url)[:30]}
    except Exception as e:
        return {"db": "error", "detail": str(e)[:200]}
