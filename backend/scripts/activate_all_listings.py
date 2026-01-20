"""
Script to activate all DRAFT listings by setting them to PUBLISHED status
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, update
from app.core.database import async_session_maker
from app.models.marketplace import Listing, ListingStatus


async def activate_all_listings():
    """Set all DRAFT listings to PUBLISHED status"""
    async with async_session_maker() as session:
        # Update all DRAFT listings to PUBLISHED
        stmt = (
            update(Listing)
            .where(Listing.status == ListingStatus.DRAFT)
            .values(status=ListingStatus.PUBLISHED)
        )
        
        result = await session.execute(stmt)
        await session.commit()
        
        count = result.rowcount
        print(f"✅ Activé {count} publications (DRAFT → PUBLISHED)")
        
        # Show current status distribution
        status_query = select(Listing.status, Listing.id).order_by(Listing.created_at.desc())
        result = await session.execute(status_query)
        listings = result.all()
        
        print(f"\n📊 Total publications: {len(listings)}")
        status_counts = {}
        for status, _ in listings:
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for status, count in status_counts.items():
            print(f"   - {status}: {count}")


if __name__ == "__main__":
    print("🔄 Activation de toutes les publications...\n")
    asyncio.run(activate_all_listings())
    print("\n✅ Terminé!")
