from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Message content")
    
    @validator('content')
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Message content cannot be empty')
        if len(v) > 5000:
            raise ValueError('Message content too long (max 5000 characters)')
        return v.strip()


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    participant_user_id: UUID
    listing_id: Optional[UUID] = None
    initial_message: str


class ConversationResponse(BaseModel):
    id: UUID
    listing_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
