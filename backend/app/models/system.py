from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base
from app.core.types import GUID


class NotificationChannel(str, enum.Enum):
    PUSH = "PUSH"
    SMS = "SMS"
    IN_APP = "IN_APP"


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    title = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    actor_user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(GUID(), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    actor = relationship("User", back_populates="audit_logs", foreign_keys=[actor_user_id])


class LoginHistory(Base):
    """Historique des connexions pour la sécurité"""
    __tablename__ = "login_history"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # mobile, desktop, tablet
    location = Column(String, nullable=True)  # Ville/Pays estimé
    success = Column(String, nullable=False, default="true")  # true/false
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id])


class SiteVisit(Base):
    """Chaque visite de la plateforme — anonyme ou identifiée"""
    __tablename__ = "site_visits"

    id          = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id  = Column(String, nullable=False, index=True)   # UUID côté navigateur
    ip_address  = Column(String, nullable=True)
    user_agent  = Column(String, nullable=True)
    device_type = Column(String, nullable=True)                # mobile / desktop / tablet
    referrer    = Column(String, nullable=True)                # d'où vient la visite
    page        = Column(String, nullable=True)                # URL de la page visitée
    action      = Column(String, nullable=False, default="visit")  # visit / register / login
    user_id     = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at  = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class TwoFactorCode(Base):
    """Codes 2FA temporaires"""
    __tablename__ = "two_factor_codes"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(6), nullable=False)
    purpose = Column(String, nullable=False, default="login")  # login, password_reset, etc.
    expires_at = Column(DateTime, nullable=False)
    used = Column(String, nullable=False, default="false")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id])
