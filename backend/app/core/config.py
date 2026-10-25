from pydantic_settings import BaseSettings
import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


def _fix_db_url(url: str) -> str:
    """Normalize provider URLs for SQLAlchemy's asyncpg driver."""
    url = url.strip()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # Legacy Render hostname normalization is retained only for rollback compatibility.
    if "@dpg-" in url and ".render.com" not in url:
        # Append region domain suffix for frankfurt
        url = url.replace("@dpg-", "@dpg-").replace("-a/", "-a.frankfurt-postgres.render.com/")
        if "-a:" in url:
            url = url.replace("-a:", "-a.frankfurt-postgres.render.com:")
    parts = urlsplit(url)
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key.lower() not in {"sslmode", "channel_binding"}
    ]
    return urlunsplit(parts._replace(query=urlencode(query)))


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://mboa_user:mboa_password@localhost:5432/mboa_market"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.DATABASE_URL = _fix_db_url(self.DATABASE_URL)
    
    # Security
    SECRET_KEY: str = "mboa-market-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS (comma-separated origins)
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://mboa-market.netlify.app,"
        "https://mboa-backoffice-admin.netlify.app",
    )
    PRODUCTION_CORS_ORIGINS: tuple[str, ...] = (
        "https://mboa-market.netlify.app",
        "https://mboa-backoffice-admin.netlify.app",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        origins: list[str] = []
        seen: set[str] = set()
        raw_origins = (self.CORS_ORIGINS or "").split(",")
        for origin in raw_origins:
            origin = origin.strip()
            if origin and origin not in seen:
                origins.append(origin)
                seen.add(origin)
        for origin in self.PRODUCTION_CORS_ORIGINS:
            if origin not in seen:
                origins.append(origin)
                seen.add(origin)
        return origins

    @property
    def cors_origin_regex(self) -> str:
        return r"^https://([a-z0-9-]+\.)*(?:netlify\.app|vercel\.app)$|^http://(?:localhost|127\.0\.0\.1):\d+$"
    
    # SMS Configuration
    SMS_PROVIDER: str = "twilio"
    SMS_API_KEY: str = "your-sms-api-key"
    SMS_API_SECRET: str = "your-sms-api-secret"
    
    # Storage
    STORAGE_BACKEND: str = "local"
    STORAGE_PATH: str = "./uploads"
    
    # Payment
    PAYMENT_PROVIDER: str = "mtn_momo"
    PAYMENT_API_KEY: str = "your-payment-api-key"
    PAYMENT_API_SECRET: str = "your-payment-api-secret"
    
    # Environment
    ENVIRONMENT: str = "development"

    # AI / Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    DEMO_POST_AUTO_REPLY_ENABLED: bool = False
    
    # PostgreSQL specific settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    DB_CONNECT_TIMEOUT: int = 8
    
    class Config:
        env_file = ("backend/.env", ".env")
        extra = "ignore"


settings = Settings()
