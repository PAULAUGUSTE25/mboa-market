from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, listings, messaging, orders, security, b2b, livestock, logistics

app = FastAPI(
    title="MBOA Market API",
    description="Agricultural Marketplace Platform API",
    version="1.0.0"
)

# CORS middleware
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
