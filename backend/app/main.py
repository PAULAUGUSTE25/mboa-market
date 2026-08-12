from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.api import auth, users, listings, messaging, orders, security, b2b, livestock, logistics, admin, analytics, ai
from app.core.config import settings
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
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Ensure error responses still pass through CORS middleware."""
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    # Return CORS-enabled error response
    origin = request.headers.get("origin", "")
    allowed_origins = settings.cors_origins_list
    cors_origin = origin if origin in allowed_origins else allowed_origins[0] if allowed_origins else "*"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
        },
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
    from app.core.database import engine
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            row = result.scalar()
        return {"db": "connected", "test": row, "host": engine.url.host}
    except Exception as e:
        safe_url = f"{engine.url.drivername}://{engine.url.username}:***@{engine.url.host}:{engine.url.port}/{engine.url.database}"
        return {"db": "error", "detail": str(e), "target_host": engine.url.host, "url": safe_url}
