"""
SQLModel database models

Phase II:
- User: User accounts
- Task: Todo items

Phase III:
- Conversation: Chat sessions
- Message: Chat messages

Phase VI:
- Tag: Task categories
- TaskTag: Task-Tag junction table
"""

from .user import User, UserCreate, UserRead, UserUpdate
from .task import Task, TaskCreate, TaskRead, TaskUpdate, Priority, RecurrenceRule
from .tag import Tag, TagCreate, TagRead, TagUpdate, TaskTag
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
    "Priority",
    "RecurrenceRule",
    # Tag models (Phase VI)
    "Tag",
    "TagCreate",
    "TagRead",
    "TagUpdate",
    "TaskTag",
    # Conversation models (Phase III)
    "Conversation",
    "ConversationCreate",
    "ConversationRead",
    # Message models (Phase III)
    "Message",
    "MessageCreate",
    "MessageRead",
]

# Rebuild models to resolve forward references (TagRead in TaskRead)
TaskRead.model_rebuild()
