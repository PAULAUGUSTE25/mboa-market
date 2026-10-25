#!/usr/bin/env python3
"""
Initialize an empty Neon database using the app's models.
Do not run this before restoring a full PostgreSQL dump.
"""

import asyncio
import os
import sys

# Set environment variable to use Neon
neon_url = os.getenv("NEON_DATABASE_URL")
if not neon_url:
    print("ERROR: NEON_DATABASE_URL environment variable not set")
    sys.exit(1)

# Fix URL for asyncpg - remove query parameters that asyncpg doesn't accept
if neon_url.startswith("postgresql://"):
    neon_url = neon_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # Remove sslmode and channel_binding from URL
    if "?" in neon_url:
        neon_url = neon_url.split("?")[0]

os.environ["DATABASE_URL"] = neon_url

from app.core.database import engine, Base
import app.models  # noqa: F401 – register all models

async def main():
    print("=" * 60)
    print("Initializing Neon Database")
    print("=" * 60)

    try:
        print("\nCreating tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully")

        print("\n" + "=" * 60)
        print("Database initialization complete!")
        print("=" * 60)
        print("\nYou can now run the migration script to copy data from Render.")

    except Exception as e:
        print(f"\nERROR: Initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
