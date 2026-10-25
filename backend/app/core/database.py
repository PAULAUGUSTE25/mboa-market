import ssl
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

connect_args = {}
database_url = make_url(settings.DATABASE_URL)
if (
    database_url.drivername.startswith("postgresql")
    and database_url.host not in {"localhost", "127.0.0.1"}
):
    connect_args["ssl"] = ssl.create_default_context()
    connect_args["timeout"] = settings.DB_CONNECT_TIMEOUT

is_vercel = os.getenv("VERCEL") == "1"
engine_options = {
    "echo": False,
    "connect_args": connect_args,
}
if is_vercel:
    # Neon/PgBouncer provides the shared pool; do not retain idle connections per function instance.
    engine_options["poolclass"] = NullPool
else:
    engine_options.update({
        "pool_pre_ping": True,
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_recycle": settings.DB_POOL_RECYCLE,
    })

engine = create_async_engine(settings.DATABASE_URL, **engine_options)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
