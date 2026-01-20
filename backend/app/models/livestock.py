from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Enum as SQLEnum, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class LivestockSpecies(str, enum.Enum):
    CHICKEN = "CHICKEN"
    PIG = "PIG"
    CATTLE = "CATTLE"
    GOAT = "GOAT"
    SHEEP = "SHEEP"
    FISH = "FISH"
    OTHER = "OTHER"


class LivestockEventType(str, enum.Enum):
    STOCK_IN = "STOCK_IN"
    MORTALITY = "MORTALITY"
    FEED = "FEED"
    VACCINE = "VACCINE"
    TREATMENT = "TREATMENT"
    WEIGHT = "WEIGHT"
    NOTE = "NOTE"
    STOCK_OUT = "STOCK_OUT"


class LivestockBatch(Base):
    __tablename__ = "livestock_batches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    species = Column(SQLEnum(LivestockSpecies), nullable=False)
    name = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    initial_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    owner = relationship("User")
    events = relationship("LivestockEvent", back_populates="batch", cascade="all, delete-orphan")


class SyncClient(Base):
    __tablename__ = "sync_clients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String, nullable=False)
    platform = Column(String, nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    
    user = relationship("User")
    events = relationship("LivestockEvent", back_populates="client")


class LivestockEvent(Base):
    __tablename__ = "livestock_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("livestock_batches.id", ondelete="CASCADE"), nullable=False)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(SQLEnum(LivestockEventType), nullable=False)
    client_event_id = Column(String, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("sync_clients.id", ondelete="CASCADE"), nullable=False)
    event_at = Column(DateTime, nullable=False)
    server_received_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('client_id', 'client_event_id', name='uq_client_event'),
        Index('idx_client_event', 'client_id', 'client_event_id', unique=True),
    )
    
    batch = relationship("LivestockBatch", back_populates="events")
    owner = relationship("User")
    client = relationship("SyncClient", back_populates="events")
