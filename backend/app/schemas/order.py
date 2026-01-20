from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.models.order import OrderStatus


class OrderCreate(BaseModel):
    listing_id: UUID
    quantity: Decimal = Field(..., gt=0, description="Quantity must be greater than 0")
    delivery_address: Optional[str] = None
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        if v > 1000000:
            raise ValueError('Quantity too large')
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    
    @validator('status')
    def validate_status_transition(cls, v):
        """Validate that the status is a valid OrderStatus"""
        # Additional transition validation can be added here
        valid_statuses = [
            OrderStatus.CREATED,
            OrderStatus.AWAITING_PAYMENT,
            OrderStatus.PAID_IN_ESCROW,
            OrderStatus.IN_PREPARATION,
            OrderStatus.IN_TRANSIT,
            OrderStatus.DELIVERED_PENDING_CONFIRMATION,
            OrderStatus.COMPLETED,
            OrderStatus.DISPUTE_OPEN,
            OrderStatus.REFUNDED,
            OrderStatus.PARTIAL_RESOLUTION,
            OrderStatus.CANCELLED
        ]
        if v not in valid_statuses:
            raise ValueError(f'Invalid status. Must be one of: {[s.value for s in valid_statuses]}')
        return v


class OrderResponse(BaseModel):
    id: UUID
    buyer_id: UUID
    seller_id: UUID
    listing_id: Optional[UUID]
    status: str
    subtotal: Decimal
    fee_platform: Decimal
    fee_logistics: Decimal
    total: Decimal
    currency: str
    delivery_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
