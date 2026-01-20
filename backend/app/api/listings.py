from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.marketplace import Listing, Category, ProductRef, ListingStatus
from app.schemas.marketplace import (
    ListingCreate, ListingUpdate, ListingResponse, PaginatedResponse,
    CategoryResponse, ProductRefResponse
)
from typing import List, Optional
from uuid import uuid4, UUID
import time

router = APIRouter(prefix="/listings", tags=["Marketplace"])

# Simple in-memory cache with TTL
_cache = {
    "categories": {"data": None, "timestamp": 0},
    "products": {"data": None, "timestamp": 0}
}
CACHE_TTL = 300  # 5 minutes


@router.get("/categories/all", response_model=List[CategoryResponse])
async def get_all_categories(
    db: AsyncSession = Depends(get_db)
):
    """Get all categories - cached for 5 minutes"""
    try:
        # Check cache
        now = time.time()
        if _cache["categories"]["data"] and (now - _cache["categories"]["timestamp"]) < CACHE_TTL:
            return _cache["categories"]["data"]
        
        # Fetch from DB
        result = await db.execute(
            select(Category).where(Category.is_active == True).limit(100)
        )
        categories = result.scalars().all()
        
        # Update cache
        _cache["categories"]["data"] = categories
        _cache["categories"]["timestamp"] = now
        
        return categories
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching categories: {e}")
        return []


@router.get("/products/all", response_model=List[ProductRefResponse])
async def get_all_products(
    db: AsyncSession = Depends(get_db)
):
    """Get all product references - cached for 5 minutes"""
    try:
        # Check cache
        now = time.time()
        if _cache["products"]["data"] and (now - _cache["products"]["timestamp"]) < CACHE_TTL:
            return _cache["products"]["data"]
        
        # Fetch from DB
        result = await db.execute(
            select(ProductRef).where(ProductRef.is_active == True).limit(100)
        )
        products = result.scalars().all()
        
        # Update cache
        _cache["products"]["data"] = products
        _cache["products"]["timestamp"] = now
        
        return products
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching products: {e}")
        return []


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new listing"""
    listing = Listing(
        id=uuid4(),
        seller_id=current_user.id,
        **data.dict()
    )
    
    db.add(listing)
    await db.commit()
    await db.refresh(listing, ['photos'])
    
    return listing


@router.get("", response_model=PaginatedResponse, response_model_exclude_unset=True)
async def get_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    region: Optional[str] = None,
    domain: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get paginated listings - optimized serialization"""
    try:
        query = select(Listing).options(selectinload(Listing.photos))
        
        # Apply filters
        if category_id:
            query = query.where(Listing.category_id == category_id)
        if region:
            query = query.where(Listing.region == region)
        if domain:
            query = query.where(Listing.domain == domain)
        if status:
            query = query.where(Listing.status == status)
        else:
            query = query.where(Listing.status == ListingStatus.PUBLISHED)
        
        # Get total count - simplified to avoid subquery issues
        count_query = select(func.count(Listing.id))
        if category_id:
            count_query = count_query.where(Listing.category_id == category_id)
        if region:
            count_query = count_query.where(Listing.region == region)
        if domain:
            count_query = count_query.where(Listing.domain == domain)
        if status:
            count_query = count_query.where(Listing.status == status)
        else:
            count_query = count_query.where(Listing.status == ListingStatus.PUBLISHED)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset((page - 1) * page_size).limit(page_size)
        query = query.order_by(Listing.created_at.desc())
        
        result = await db.execute(query)
        listings = result.scalars().all()
        
        return PaginatedResponse(
            items=listings,
            total=total,
            page=page,
            page_size=page_size,
            pages=(total + page_size - 1) // page_size
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in get_listings: {e}", exc_info=True)
        # Return empty result instead of 500
        return PaginatedResponse(
            items=[],
            total=0,
            page=page,
            page_size=page_size,
            pages=0
        )


@router.get("/my/listings", response_model=List[ListingResponse])
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's listings"""
    try:
        result = await db.execute(
            select(Listing)
            .where(Listing.seller_id == current_user.id)
            .options(selectinload(Listing.photos))
            .order_by(Listing.created_at.desc())
        )
        listings = result.scalars().all()
        return listings
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in get_my_listings: {e}", exc_info=True)
        return []


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get listing by ID"""
    try:
        result = await db.execute(
            select(Listing)
            .where(Listing.id == listing_id)
            .options(selectinload(Listing.photos))
        )
        listing = result.scalar_one_or_none()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        
        return listing
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in get_listing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving listing"
        )


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: UUID,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a listing"""
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)
    
    await db.commit()
    await db.refresh(listing)
    
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a listing"""
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    await db.delete(listing)
    await db.commit()
    
    return None
