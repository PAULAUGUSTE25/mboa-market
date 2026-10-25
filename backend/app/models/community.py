from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, UniqueConstraint, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base
from app.core.types import GUID


class CommunityPost(Base):
    __tablename__ = "community_posts"
    __table_args__ = (
        Index("ix_community_posts_created_at", "created_at"),
        Index("ix_community_posts_domain_created_at", "domain", "created_at"),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    author_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String, nullable=False, default="agriculture")  # agriculture | elevage
    content = Column(Text, nullable=False)
    is_demo = Column(Boolean, nullable=False, default=False, server_default="false")
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
    __table_args__ = (
        Index("uq_post_comment_auto_reply_to", "auto_reply_to_id", unique=True),
        Index("ix_post_comments_post_created_at", "post_id", "created_at"),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_ai_generated = Column(Boolean, nullable=False, default=False, server_default="false")
    auto_reply_to_id = Column(
        GUID(),
        ForeignKey("post_comments.id", ondelete="CASCADE"),
        nullable=True,
    )

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])
