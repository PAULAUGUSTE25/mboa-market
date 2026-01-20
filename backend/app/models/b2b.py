from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class B2BRequestStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class B2BOfferStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    SHORTLISTED = "SHORTLISTED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class B2BContractStatus(str, enum.Enum):
    CREATED = "CREATED"
    SIGNED = "SIGNED"
    IN_DELIVERY = "IN_DELIVERY"
    COMPLETED = "COMPLETED"
    DISPUTED = "DISPUTED"
    CANCELLED = "CANCELLED"


class B2BRequest(Base):
    __tablename__ = "b2b_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_org_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_ref_id = Column(UUID(as_uuid=True), ForeignKey("products_ref.id", ondelete="SET NULL"), nullable=True)
    product_name = Column(String, nullable=False)
    volume = Column(Numeric(18, 3), nullable=False)
    unit = Column(String, nullable=False)
    status = Column(SQLEnum(B2BRequestStatus), nullable=False, default=B2BRequestStatus.OPEN)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    buyer = relationship("User")
    product_ref = relationship("ProductRef")
    offers = relationship("B2BOffer", back_populates="request", cascade="all, delete-orphan")
    contracts = relationship("B2BContract", back_populates="request", cascade="all, delete-orphan")


class B2BOffer(Base):
    __tablename__ = "b2b_offers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("b2b_requests.id", ondelete="CASCADE"), nullable=False)
    producer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offered_volume = Column(Numeric(18, 3), nullable=False)
    price_per_unit = Column(Numeric(18, 2), nullable=False)
    status = Column(SQLEnum(B2BOfferStatus), nullable=False, default=B2BOfferStatus.SUBMITTED)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    request = relationship("B2BRequest", back_populates="offers")
    producer = relationship("User")


class B2BContract(Base):
    __tablename__ = "b2b_contracts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("b2b_requests.id", ondelete="RESTRICT"), nullable=False)
    buyer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(B2BContractStatus), nullable=False, default=B2BContractStatus.CREATED)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    request = relationship("B2BRequest", back_populates="contracts")
    buyer = relationship("User")
