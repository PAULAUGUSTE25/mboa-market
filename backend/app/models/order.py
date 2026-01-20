from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    CREATED = "CREATED"
    AWAITING_PAYMENT = "AWAITING_PAYMENT"
    PAID_IN_ESCROW = "PAID_IN_ESCROW"
    IN_PREPARATION = "IN_PREPARATION"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED_PENDING_CONFIRMATION = "DELIVERED_PENDING_CONFIRMATION"
    COMPLETED = "COMPLETED"
    DISPUTE_OPEN = "DISPUTE_OPEN"
    REFUNDED = "REFUNDED"
    PARTIAL_RESOLUTION = "PARTIAL_RESOLUTION"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    PENDING = "PENDING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class EscrowStatus(str, enum.Enum):
    HELD = "HELD"
    RELEASED = "RELEASED"
    REFUNDED = "REFUNDED"
    PARTIAL_RELEASE = "PARTIAL_RELEASE"


class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED_BUYER = "RESOLVED_BUYER"
    RESOLVED_SELLER = "RESOLVED_SELLER"
    PARTIAL = "PARTIAL"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="SET NULL"), nullable=True)
    status = Column(SQLEnum(OrderStatus), nullable=False, default=OrderStatus.CREATED)
    subtotal = Column(Numeric(18, 2), nullable=False, default=0)
    fee_platform = Column(Numeric(18, 2), nullable=False, default=0)
    fee_logistics = Column(Numeric(18, 2), nullable=False, default=0)
    total = Column(Numeric(18, 2), nullable=False, default=0)
    currency = Column(String, nullable=False, default="XAF")
    delivery_mode = Column(String, nullable=True)
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    buyer = relationship("User", back_populates="orders_as_buyer", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="orders_as_seller", foreign_keys=[seller_id])
    listing = relationship("Listing", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)
    escrow_hold = relationship("EscrowHold", back_populates="order", uselist=False)
    dispute = relationship("Dispute", back_populates="order", uselist=False)
    reviews = relationship("Review", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_ref_id = Column(UUID(as_uuid=True), ForeignKey("products_ref.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Numeric(18, 3), nullable=False)
    unit = Column(String, nullable=False)
    price_per_unit = Column(Numeric(18, 2), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    
    order = relationship("Order", back_populates="items")
    product_ref = relationship("ProductRef")


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, unique=True)
    provider = Column(String, nullable=False)
    provider_ref = Column(String, nullable=True, unique=True)
    status = Column(SQLEnum(PaymentStatus), nullable=False, default=PaymentStatus.INITIATED)
    amount = Column(Numeric(18, 2), nullable=False)
    idempotency_key = Column(String, nullable=False, unique=True)
    initiated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    
    order = relationship("Order", back_populates="payment")
    escrow_hold = relationship("EscrowHold", back_populates="payment")


class EscrowHold(Base):
    __tablename__ = "escrow_holds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, unique=True)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(EscrowStatus), nullable=False, default=EscrowStatus.HELD)
    held_amount = Column(Numeric(18, 2), nullable=False)
    released_amount = Column(Numeric(18, 2), nullable=False, default=0)
    released_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="escrow_hold")
    payment = relationship("Payment", back_populates="escrow_hold")


class Dispute(Base):
    __tablename__ = "disputes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, unique=True)
    opened_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(DisputeStatus), nullable=False, default=DisputeStatus.OPEN)
    reason = Column(String, nullable=False)
    decided_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="dispute")
    opener = relationship("User", foreign_keys=[opened_by])
    decider = relationship("User", foreign_keys=[decided_by])


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    from_user = relationship("User", back_populates="reviews_given", foreign_keys=[from_user_id])
    to_user = relationship("User", back_populates="reviews_received", foreign_keys=[to_user_id])
    order = relationship("Order", back_populates="reviews")
