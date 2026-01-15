"""
SQLModel database models

Phase II:
- User: User accounts
- Task: Todo items

Phase III:
- Conversation: Chat sessions
- Message: Chat messages
"""

from .user import User, UserCreate, UserRead, UserUpdate
from .task import Task, TaskCreate, TaskRead, TaskUpdate
from .conversation import Conversation, ConversationCreate, ConversationRead
from .message import Message, MessageCreate, MessageRead

__all__ = [
    # User models
    "User",
    "UserCreate",
    "UserRead",
    "UserUpdate",
    # Task models
    "Task",
    "TaskCreate",
    "TaskRead",
    "TaskUpdate",
    # Conversation models (Phase III)
    "Conversation",
    "ConversationCreate",
    "ConversationRead",
    # Message models (Phase III)
    "Message",
    "MessageCreate",
    "MessageRead",
]
