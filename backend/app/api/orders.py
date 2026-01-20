from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatus
from app.models.marketplace import Listing
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from typing import List, Optional
from uuid import uuid4, UUID
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order"""
    try:
        logger.info(f"User {current_user.id} creating order for listing {data.listing_id}")
        # Get listing
        result = await db.execute(
            select(Listing).where(Listing.id == data.listing_id)
        )
        listing = result.scalar_one_or_none()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        
        # Check if trying to order own listing
        if listing.seller_id == current_user.id:
            logger.warning(f"User {current_user.id} attempted to order own listing {listing.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot order your own listing"
            )
        
        # Verify stock availability
        logger.info(f"Stock check: Available={listing.quantity}, Requested={data.quantity}")
        if listing.quantity < data.quantity:
            logger.warning(f"Insufficient stock for listing {listing.id}: {listing.quantity} < {data.quantity}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {listing.quantity}, Requested: {data.quantity}"
            )
        
        # Calculate totals
        subtotal = listing.price_per_unit * data.quantity
        fee_platform = subtotal * Decimal('0.05')  # 5% platform fee
        fee_logistics = Decimal('1000')  # Fixed logistics fee
        total = subtotal + fee_platform + fee_logistics
        
        # Create order
        order = Order(
            id=uuid4(),
            buyer_id=current_user.id,
            seller_id=listing.seller_id,
            listing_id=listing.id,
            status=OrderStatus.AWAITING_PAYMENT,  # Initial status
            subtotal=subtotal,
            fee_platform=fee_platform,
            fee_logistics=fee_logistics,
            total=total,
            currency=listing.currency,
            delivery_address=data.delivery_address
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        logger.info(f"Order created successfully: {order.id}, total: {order.total} {order.currency}")
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )


@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders (as buyer or seller) with optional status filter"""
    query = select(Order).where(
        or_(
            Order.buyer_id == current_user.id,
            Order.seller_id == current_user.id
        )
    )
    
    # Apply status filter if provided
    if status:
        # Validate status value
        valid_statuses = [s.value for s in OrderStatus]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{status}'. Valid values: {valid_statuses}"
            )
        
        try:
            status_enum = OrderStatus(status)
            query = query.where(Order.status == status_enum)
        except (ValueError, KeyError) as e:
            logger.error(f"Error converting status '{status}': {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{status}'. Valid values: {valid_statuses}"
            )
    
    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order by ID"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status_data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only seller can update order status
    if order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can update order status"
        )
    
    # Validate status transition (basic validation)
    current_status = order.status
    new_status = status_data.status
    
    # Prevent invalid transitions
    invalid_transitions = [
        (OrderStatus.COMPLETED, OrderStatus.PENDING),
        (OrderStatus.CANCELLED, OrderStatus.IN_PREPARATION),
        (OrderStatus.REFUNDED, OrderStatus.PAID_IN_ESCROW),
    ]
    
    if (current_status, new_status) in invalid_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {current_status.value} to {new_status.value}"
        )
    
    order.status = new_status
    await db.commit()
    
    logger.info(f"Order {order_id} status updated from {current_status.value} to {new_status.value} by user {current_user.id}")
    return {"message": "Order status updated", "status": new_status.value}
