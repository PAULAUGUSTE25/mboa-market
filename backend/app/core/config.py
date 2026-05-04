from pydantic_settings import BaseSettings
import os


def _fix_db_url(url: str) -> str:
    """Render fournit postgresql://, SQLAlchemy async a besoin de postgresql+asyncpg://"""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
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
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    
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
    
    # PostgreSQL specific settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    class Config:
        env_file = ".env"


settings = Settings()
