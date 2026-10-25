from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
from app.api import auth, users, listings, messaging, orders, security, b2b, livestock, logistics, admin, analytics, ai, community
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate database access; run schema creation only in local development."""
    is_production = settings.ENVIRONMENT.lower() == "production" or os.getenv("VERCEL") == "1"
    try:
        from app.core.database import engine, Base
        import app.models  # noqa: F401 – enregistre tous les modèles dans Base.metadata
        if is_production:
            if engine.url.host in {"localhost", "127.0.0.1"}:
                raise RuntimeError("Production DATABASE_URL must point to a remote PostgreSQL service.")
            if settings.SECRET_KEY == "mboa-market-secret-key-change-in-production-2024":
                raise RuntimeError("Set SECRET_KEY in the production environment.")
        async with engine.begin() as conn:
            if not is_production:
                await conn.run_sync(Base.metadata.create_all)
            else:
                await conn.execute(text("SELECT 1"))
        logger.info("Database startup check succeeded")
    except Exception:
        logger.exception("Database startup check failed")
        if is_production:
            raise

    yield

app = FastAPI(
    title="MBOA Market API",
    description="Agricultural Marketplace Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Serve uploaded files
try:
    app.mount("/uploads", StaticFiles(directory=settings.STORAGE_PATH), name="uploads")
except Exception:
    # If directory doesn't exist yet, ignore until created
    pass

# CORS middleware — keep exact origins for production and a regex fallback for deployed frontends.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=settings.cors_origin_regex,
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
app.include_router(community.router, prefix="/api")

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
    from app.core.database import engine
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        logger.exception("API health check failed because the database is unavailable")
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "unavailable"})
    return {"status": "healthy", "api": "online", "database": "connected"}


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
