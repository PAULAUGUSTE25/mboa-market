import asyncio
from app.core.database import engine, Base
import app.models.community
import app.models

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("ALL_TABLES_READY")

if __name__ == "__main__":
    asyncio.run(main())
