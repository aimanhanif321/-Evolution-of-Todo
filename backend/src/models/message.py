"""
Message model for Phase III AI Chatbot

Stores individual messages within conversations.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String, Text
from datetime import datetime
from typing import Optional, List, Any, TYPE_CHECKING
from pydantic import field_validator
import json

if TYPE_CHECKING:
    from .conversation import Conversation


class MessageBase(SQLModel):
    """Base model for message data"""
    role: str = Field(nullable=False)
    content: str = Field(nullable=False)

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Validate role is either 'user' or 'assistant'"""
        if v not in ('user', 'assistant'):
            raise ValueError("role must be 'user' or 'assistant'")
        return v


class Message(MessageBase, table=True):
    """Database model for messages"""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: str = Field(sa_column=Column(String, nullable=False, index=True))

    role: str = Field(sa_column=Column(String(20), nullable=False))
    content: str = Field(sa_column=Column(Text, nullable=False))
    tool_calls: Optional[str] = Field(default=None)  # JSON string stored in DB

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    def get_tool_calls(self) -> Optional[List[dict]]:
        """Parse tool_calls JSON string to list"""
        if self.tool_calls:
            return json.loads(self.tool_calls)
        return None

    def set_tool_calls(self, calls: List[dict]) -> None:
        """Serialize tool calls list to JSON string"""
        if calls:
            self.tool_calls = json.dumps(calls)
        else:
            self.tool_calls = None


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    conversation_id: int
    user_id: str
    tool_calls: Optional[List[dict]] = None


class MessageRead(MessageBase):
    """Schema for reading a message"""
    id: int
    conversation_id: int
    user_id: str
    tool_calls: Optional[List[dict]] = None
    created_at: datetime
