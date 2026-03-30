from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Date, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base
from app.core.types import GUID


class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    PAUSED = "PAUSED"
    SOLD_OUT = "SOLD_OUT"
    REJECTED = "REJECTED"
    REMOVED = "REMOVED"


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name_fr = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    kind = Column(String, nullable=False)
    parent_id = Column(GUID(), ForeignKey("categories.id", ondelete="CASCADE"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    
    parent = relationship("Category", remote_side=[id], backref="children")
    listings = relationship("Listing", back_populates="category")


class ProductRef(Base):
    __tablename__ = "products_ref"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name_fr = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    unit_default = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    
    listings = relationship("Listing", back_populates="product_ref")


class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    seller_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(GUID(), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    product_ref_id = Column(GUID(), ForeignKey("products_ref.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=True)
    variety = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    quantity = Column(Numeric(18, 3), nullable=False, default=0)
    unit = Column(String, nullable=False)
    price_per_unit = Column(Numeric(18, 2), nullable=False, default=0)
    currency = Column(String, nullable=False, default="XAF")
    region = Column(String, nullable=False)
    locality = Column(String, nullable=True)
    lat = Column(Numeric(9, 6), nullable=True)
    lng = Column(Numeric(9, 6), nullable=True)
    available_from = Column(Date, nullable=True)
    status = Column(SQLEnum(ListingStatus), nullable=False, default=ListingStatus.PUBLISHED)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    category = relationship("Category", back_populates="listings")
    product_ref = relationship("ProductRef", back_populates="listings")
    photos = relationship("ListingPhoto", back_populates="listing", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="listing")


class ListingPhoto(Base):
    __tablename__ = "listing_photos"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    listing_id = Column(GUID(), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    storage_key = Column(String, nullable=False)
    position = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    listing = relationship("Listing", back_populates="photos")
