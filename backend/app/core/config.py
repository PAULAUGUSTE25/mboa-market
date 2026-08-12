from pydantic_settings import BaseSettings
import os


def _fix_db_url(url: str) -> str:
    """Render fournit postgresql://, SQLAlchemy async a besoin de postgresql+asyncpg://"""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # Render internal database host fix if internal hostname without domain is passed
    if "@dpg-" in url and ".render.com" not in url:
        # Append region domain suffix for frankfurt
        url = url.replace("@dpg-", "@dpg-").replace("-a/", "-a.frankfurt-postgres.render.com/")
        if "-a:" in url:
            url = url.replace("-a:", "-a.frankfurt-postgres.render.com:")
    # Render PostgreSQL requires ssl parameter for asyncpg
    if ("render.com" in url or "dpg-" in url) and "ssl=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}ssl=require"
    return url


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
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://mboa-market.netlify.app,"
        "https://mboa-backoffice-admin.netlify.app"
    )
    PRODUCTION_CORS_ORIGINS: tuple[str, ...] = (
        "https://mboa-market.netlify.app",
        "https://mboa-backoffice-admin.netlify.app",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        origins: list[str] = []
        seen: set[str] = set()
        for origin in self.CORS_ORIGINS.split(","):
            origin = origin.strip()
            if origin and origin not in seen:
                origins.append(origin)
                seen.add(origin)
        for origin in self.PRODUCTION_CORS_ORIGINS:
            if origin not in seen:
                origins.append(origin)
                seen.add(origin)
        return origins
    
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
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # PostgreSQL specific settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    class Config:
        env_file = ".env"


settings = Settings()
