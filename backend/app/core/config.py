from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./mboa_market.db"
    SECRET_KEY: str = "mboa-market-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    
    SMS_PROVIDER: str = "twilio"
    SMS_API_KEY: str = "your-sms-api-key"
    SMS_API_SECRET: str = "your-sms-api-secret"
    
    STORAGE_BACKEND: str = "local"
    STORAGE_PATH: str = "./uploads"
    
    PAYMENT_PROVIDER: str = "mtn_momo"
    PAYMENT_API_KEY: str = "your-payment-api-key"
    PAYMENT_API_SECRET: str = "your-payment-api-secret"
    
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"


settings = Settings()
