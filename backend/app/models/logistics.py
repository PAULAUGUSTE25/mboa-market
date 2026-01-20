from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class TransportRequestStatus(str, enum.Enum):
    OPEN = "OPEN"
    MATCHED = "MATCHED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class TransportMissionStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    DISPUTED = "DISPUTED"


class Hub(Base):
    __tablename__ = "hubs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)


class TransportRequest(Base):
    __tablename__ = "transport_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    status = Column(SQLEnum(TransportRequestStatus), nullable=False, default=TransportRequestStatus.OPEN)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    requester = relationship("User")
    order = relationship("Order")
    mission = relationship("TransportMission", back_populates="request", uselist=False)


class TransportMission(Base):
    __tablename__ = "transport_missions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("transport_requests.id", ondelete="CASCADE"), nullable=False, unique=True)
    transporter_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(TransportMissionStatus), nullable=False, default=TransportMissionStatus.ASSIGNED)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    request = relationship("TransportRequest", back_populates="mission")
    transporter = relationship("User")
