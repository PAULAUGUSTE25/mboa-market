from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
# from app.core.rate_limiter import limiter, rate_limit_exceeded_handler
# Temporarily disabled auth and security imports (missing dependencies)
# from app.api import auth, users, listings, orders, b2b, logistics, livestock, messaging, security
from app.api import listings, orders, b2b, logistics, livestock, messaging
# from slowapi.errors import RateLimitExceeded
import traceback
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MBOA Market API",
    description="Agricultural Marketplace Platform API",
    version="1.0.0"
)

# Rate limiter temporarily disabled - install slowapi to enable
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS middleware - Must be added FIRST before other middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://mboa-market.netlify.app",
        "https://*.netlify.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"ERROR: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )

# Include routers
# Temporarily disabled auth, users, and security routes (missing dependencies)
# app.include_router(auth.router, prefix="/api")
# app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(b2b.router, prefix="/api")
app.include_router(logistics.router, prefix="/api")
app.include_router(livestock.router, prefix="/api")
app.include_router(messaging.router, prefix="/api")
# app.include_router(security.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "MBOA Market API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
