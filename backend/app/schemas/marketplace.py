from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class CategoryResponse(BaseModel):
    id: UUID
    name_fr: str
    name_en: str
    kind: str
    parent_id: Optional[UUID] = None
    is_active: bool
    
    class Config:
        from_attributes = True


class ProductRefResponse(BaseModel):
    id: UUID
    name_fr: str
    name_en: str
    unit_default: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True


class ListingPhotoResponse(BaseModel):
    id: UUID
    storage_key: str
    position: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ListingBase(BaseModel):
    category_id: UUID
    product_ref_id: Optional[UUID] = None
    title: Optional[str] = None
    variety: Optional[str] = None
    domain: Optional[str] = None
    quantity: Decimal
    unit: str
    price_per_unit: Decimal
    currency: str = "XAF"
    region: str
    locality: Optional[str] = None
    lat: Optional[Decimal] = None
    lng: Optional[Decimal] = None
    available_from: Optional[date] = None


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    variety: Optional[str] = None
    domain: Optional[str] = None
    quantity: Optional[Decimal] = None
    price_per_unit: Optional[Decimal] = None
    region: Optional[str] = None
    locality: Optional[str] = None
    status: Optional[str] = None


class ListingResponse(ListingBase):
    id: UUID
    seller_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    photos: List[ListingPhotoResponse] = []
    
    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: List[ListingResponse]
    total: int
    page: int
    page_size: int
    pages: int
