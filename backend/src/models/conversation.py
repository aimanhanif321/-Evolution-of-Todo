"""
Conversation model for Phase III AI Chatbot

Stores chat sessions between users and the AI assistant.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .message import Message


class ConversationBase(SQLModel):
    """Base model for conversation data"""
    pass


class Conversation(ConversationBase, table=True):
    """Database model for conversations"""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(sa_column=Column(String, nullable=False, index=True))

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    user_id: str


class ConversationRead(ConversationBase):
    """Schema for reading a conversation"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None
