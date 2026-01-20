"""
Migration script to add domain field to profiles and listings tables
"""
import sys
import os
import asyncio
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.core.database import engine

async def add_domain_fields():
    """Add domain column to profiles and listings tables"""
    async with engine.begin() as conn:
        try:
            # Add domain to profiles table
            print("Adding domain column to profiles table...")
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN IF NOT EXISTS domain VARCHAR;
            """))
            print("✓ Domain column added to profiles table")
            
            # Add domain to listings table
            print("Adding domain column to listings table...")
            await conn.execute(text("""
                ALTER TABLE listings 
                ADD COLUMN IF NOT EXISTS domain VARCHAR;
            """))
            print("✓ Domain column added to listings table")
            
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(add_domain_fields())
