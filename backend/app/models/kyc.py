from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base
from app.core.types import GUID


class KYCStatus(str, enum.Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class KYCSubmission(Base):
    __tablename__ = "kyc_submissions"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(KYCStatus), nullable=False, default=KYCStatus.PENDING)
    kyc_level = Column(Integer, nullable=False, default=1)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    reviewed_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="kyc_submissions", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    documents = relationship("KYCDocument", back_populates="submission", cascade="all, delete-orphan")


class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    submission_id = Column(GUID(), ForeignKey("kyc_submissions.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)
    checksum_sha256 = Column(String, nullable=True)
    encrypted = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    submission = relationship("KYCSubmission", back_populates="documents")
