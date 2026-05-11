from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Profile
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.schemas.messaging import MessageCreate, MessageResponse, ConversationCreate, ConversationResponse
from typing import List
from uuid import uuid4, UUID
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
from datetime import datetime

router = APIRouter(prefix="/messages/conversations", tags=["Messaging"])


class PaginatedConversationsResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    page_size: int
    pages: int


class PaginatedMessagesResponse(BaseModel):
    items: List[MessageResponse]
    total: int
    page: int
    page_size: int
    pages: int


@router.get("", response_model=PaginatedConversationsResponse)
async def get_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all conversations for current user with pagination"""
    logger.info(f"Fetching conversations for user {current_user.id}, page {page}")
    # Get total count
    count_result = await db.execute(
        select(func.count(Conversation.id))
        .join(ConversationParticipant)
        .where(ConversationParticipant.user_id == current_user.id)
    )
    total = count_result.scalar()
    
    # Get paginated conversations with optimized loading
    result = await db.execute(
        select(Conversation)
        .join(ConversationParticipant)
        .where(ConversationParticipant.user_id == current_user.id)
        .options(
            selectinload(Conversation.participants),
            selectinload(Conversation.messages)
        )
        .order_by(Conversation.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    conversations = result.scalars().all()
    
    # Get all participant user IDs to load profiles in one query
    participant_ids = set()
    for conv in conversations:
        for p in conv.participants:
            if p.user_id != current_user.id:
                participant_ids.add(p.user_id)
    
    # Load all profiles in one query (optimization!)
    profiles_dict = {}
    if participant_ids:
        profiles_result = await db.execute(
            select(Profile).where(Profile.user_id.in_(participant_ids))
        )
        profiles = profiles_result.scalars().all()
        profiles_dict = {p.user_id: p for p in profiles}
    
    # Format response with participant info and unread count
    response = []
    for conv in conversations:
        # Get other participant
        other_participant = next(
            (p for p in conv.participants if p.user_id != current_user.id),
            None
        )
        
        if other_participant:
            # Get participant profile from dict (no DB query!)
            profile = profiles_dict.get(other_participant.user_id)
            
            # Get last message
            last_message = conv.messages[-1] if conv.messages else None
            
            # Count unread messages
            current_participant = next(
                (p for p in conv.participants if p.user_id == current_user.id),
                None
            )
            
            unread_count = 0
            if current_participant and current_participant.last_read_at:
                unread_count = sum(
                    1 for msg in conv.messages
                    if msg.sender_id != current_user.id and msg.created_at > current_participant.last_read_at
                )
            elif current_participant:
                unread_count = sum(
                    1 for msg in conv.messages
                    if msg.sender_id != current_user.id
                )
            
            response.append({
                "id": str(conv.id),
                "participant_id": str(other_participant.user_id),
                "participant_name": profile.display_name if profile else "Unknown",
                "last_message": last_message.content if last_message else None,
                "unread_count": unread_count,
                "updated_at": conv.updated_at.isoformat(),
                "listing_id": str(conv.listing_id) if conv.listing_id else None
            })
    
    return PaginatedConversationsResponse(
        items=response,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation"""
    # Check if conversation already exists between these users
    existing = await db.execute(
        select(Conversation)
        .join(ConversationParticipant, ConversationParticipant.conversation_id == Conversation.id)
        .where(
            and_(
                ConversationParticipant.user_id.in_([current_user.id, data.participant_user_id]),
                Conversation.listing_id == data.listing_id
            )
        )
        .group_by(Conversation.id)
        .having(func.count(ConversationParticipant.user_id) == 2)
    )
    existing_conv = existing.scalar_one_or_none()
    
    if existing_conv:
        # Add initial message to existing conversation
        message = Message(
            id=uuid4(),
            conversation_id=existing_conv.id,
            sender_id=current_user.id,
            content=data.initial_message
        )
        db.add(message)
        existing_conv.updated_at = datetime.utcnow()
        await db.commit()
        return {"id": str(existing_conv.id), "message": "Message sent to existing conversation"}
    
    # Create new conversation
    conversation = Conversation(
        id=uuid4(),
        listing_id=data.listing_id
    )
    db.add(conversation)
    await db.flush()
    
    # Add participants
    participant1 = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=current_user.id
    )
    participant2 = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=data.participant_user_id
    )
    db.add(participant1)
    db.add(participant2)
    
    # Add initial message
    message = Message(
        id=uuid4(),
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=data.initial_message
    )
    db.add(message)
    
    await db.commit()
    await db.refresh(conversation)
    
    return {"id": str(conversation.id), "message": "Conversation created"}


@router.get("/{conversation_id}/messages", response_model=PaginatedMessagesResponse)
async def get_messages(
    conversation_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages in a conversation with pagination"""
    logger.info(f"Fetching messages for conversation {conversation_id}, page {page}")
    # Verify user is participant
    participant_result = await db.execute(
        select(ConversationParticipant)
        .where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.id
            )
        )
    )
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this conversation"
        )
    
    # Get total count
    count_result = await db.execute(
        select(func.count(Message.id))
        .where(Message.conversation_id == conversation_id)
    )
    total = count_result.scalar()
    
    # Get paginated messages (most recent first, then reverse for display)
    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    messages = list(reversed(messages_result.scalars().all()))
    
    return PaginatedMessagesResponse(
        items=messages,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size
    )


@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: UUID,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a conversation"""
    logger.info(f"User {current_user.id} sending message to conversation {conversation_id}")
    # Verify user is participant
    participant_result = await db.execute(
        select(ConversationParticipant)
        .where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.id
            )
        )
    )
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this conversation"
        )
    
    # Validation is handled by MessageCreate schema
    # Create message
    message = Message(
        id=uuid4(),
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message_data.content
    )
    db.add(message)
    
    # Update conversation timestamp
    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = conv_result.scalar_one()
    conversation.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(message)
    
    return message


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation (only for participants)"""
    logger.info(f"User {current_user.id} attempting to delete conversation {conversation_id}")
    # Verify user is participant
    participant_result = await db.execute(
        select(ConversationParticipant)
        .where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.id
            )
        )
    )
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this conversation"
        )
    
    # Delete conversation (cascade will delete participants and messages)
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    await db.delete(conversation)
    await db.commit()
    
    logger.info(f"Conversation {conversation_id} deleted by user {current_user.id}")
    return None
