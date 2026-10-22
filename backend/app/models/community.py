from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base
from app.core.types import GUID


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    author_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String, nullable=False, default="agriculture")  # agriculture | elevage
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id])
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan", order_by="PostComment.created_at")


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_like"),
    )

    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User")


class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])
