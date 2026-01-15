# Data Model: Todo AI Chatbot

**Feature**: 003-todo-ai-chatbot
**Date**: 2026-01-15
**Database**: Neon Serverless PostgreSQL (existing)

---

## Overview

Phase III introduces two new tables (`conversations`, `messages`) to support the AI chatbot feature. Existing tables (`users`, `tasks`) remain unchanged per Golden Rule GR-002.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXISTING (DO NOT MODIFY)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐              ┌──────────────┐                     │
│  │    users     │              │    tasks     │                     │
│  ├──────────────┤              ├──────────────┤                     │
│  │ id (PK)      │──────────────│ user_id (FK) │                     │
│  │ email        │      1:N     │ id (PK)      │                     │
│  │ name         │              │ title        │                     │
│  │ hashed_pwd   │              │ description  │                     │
│  │ created_at   │              │ completed    │                     │
│  └──────────────┘              │ created_at   │                     │
│         │                      │ updated_at   │                     │
│         │                      └──────────────┘                     │
│         │                                                            │
├─────────┼────────────────────────────────────────────────────────────┤
│         │              NEW (PHASE III)                               │
├─────────┼────────────────────────────────────────────────────────────┤
│         │                                                            │
│         │ 1:N     ┌──────────────┐                                  │
│         └─────────│conversations │                                  │
│                   ├──────────────┤                                  │
│                   │ id (PK)      │                                  │
│                   │ user_id (FK) │──────┐                           │
│                   │ created_at   │      │                           │
│                   │ updated_at   │      │                           │
│                   └──────────────┘      │                           │
│                          │              │                           │
│                          │ 1:N         │                           │
│                          ▼              │                           │
│                   ┌──────────────┐      │                           │
│                   │   messages   │      │                           │
│                   ├──────────────┤      │                           │
│                   │ id (PK)      │      │                           │
│                   │ conv_id (FK) │      │                           │
│                   │ user_id (FK) │──────┘                           │
│                   │ role         │                                  │
│                   │ content      │                                  │
│                   │ tool_calls   │                                  │
│                   │ created_at   │                                  │
│                   └──────────────┘                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Tables

### conversations

Stores chat sessions between users and the AI assistant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique conversation identifier |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | Owner of the conversation |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | When conversation started |
| updated_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | Last activity timestamp |

**Indexes**:
```sql
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
```

**Constraints**:
- `user_id` must reference an existing user
- `updated_at` auto-updates on message insertion (application-level)

---

### messages

Stores individual messages within conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique message identifier |
| conversation_id | UUID | FOREIGN KEY → conversations.id, NOT NULL | Parent conversation |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | User who owns this message |
| role | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant') | Message sender role |
| content | TEXT | NOT NULL | Message text content |
| tool_calls | JSONB | NULLABLE | MCP tool call metadata (assistant only) |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | When message was created |

**Indexes**:
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Constraints**:
- `conversation_id` must reference an existing conversation
- `user_id` must match the conversation's user_id (application-level)
- `role` must be either 'user' or 'assistant'
- `tool_calls` is only populated for assistant messages

---

## SQLModel Definitions

### Conversation Model

```python
# backend/src/models/conversation.py

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .message import Message

class ConversationBase(SQLModel):
    """Base model for conversation data"""
    pass

class Conversation(ConversationBase, table=True):
    """Database model for conversations"""
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    user_id: UUID

class ConversationRead(ConversationBase):
    """Schema for reading a conversation"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None
```

### Message Model

```python
# backend/src/models/message.py

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
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
        if v not in ('user', 'assistant'):
            raise ValueError("role must be 'user' or 'assistant'")
        return v

class Message(MessageBase, table=True):
    """Database model for messages"""
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    def get_tool_calls(self) -> Optional[List[dict]]:
        """Parse tool_calls JSON string to list"""
        if self.tool_calls:
            return json.loads(self.tool_calls)
        return None

    def set_tool_calls(self, calls: List[dict]) -> None:
        """Serialize tool calls list to JSON string"""
        self.tool_calls = json.dumps(calls)

class MessageCreate(MessageBase):
    """Schema for creating a message"""
    conversation_id: UUID
    user_id: UUID
    tool_calls: Optional[List[dict]] = None

class MessageRead(MessageBase):
    """Schema for reading a message"""
    id: UUID
    conversation_id: UUID
    user_id: UUID
    tool_calls: Optional[List[dict]] = None
    created_at: datetime
```

---

## Tool Calls Schema

The `tool_calls` JSONB column stores MCP tool invocation metadata:

```json
[
  {
    "tool": "add_task",
    "params": {
      "title": "Buy groceries",
      "description": null
    },
    "result": {
      "task_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "created",
      "title": "Buy groceries"
    },
    "executed_at": "2026-01-15T10:30:00Z"
  }
]
```

**Schema Definition**:
```python
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ToolCall(BaseModel):
    tool: str  # Tool name: add_task, list_tasks, etc.
    params: dict[str, Any]  # Input parameters
    result: Optional[dict[str, Any]] = None  # Tool output
    executed_at: datetime
```

---

## Database Migration

### Alembic Migration Script

```python
# backend/alembic/versions/xxx_add_chat_tables.py

"""Add conversations and messages tables for Phase III chatbot

Revision ID: xxx
Revises: [previous_revision]
Create Date: 2026-01-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = 'xxx_add_chat_tables'
down_revision = '[previous_revision]'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'),
                  nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(),
                  nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(),
                  nullable=False),
    )

    # Create indexes for conversations
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_updated_at', 'conversations',
                    ['updated_at'], postgresql_ops={'updated_at': 'DESC'})

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text('uuid_generate_v4()')),
        sa.Column('conversation_id', UUID(as_uuid=True),
                  sa.ForeignKey('conversations.id'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'),
                  nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(),
                  nullable=False),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='ck_messages_role'),
    )

    # Create indexes for messages
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_user_id', 'messages', ['user_id'])
    op.create_index('idx_messages_created_at', 'messages', ['created_at'])

def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('conversations')
```

---

## Validation Rules

### Conversation Validation
| Rule | Description |
|------|-------------|
| User exists | user_id must reference valid user |
| Ownership | User can only access own conversations |

### Message Validation
| Rule | Description |
|------|-------------|
| Conversation exists | conversation_id must reference valid conversation |
| User match | message.user_id must equal conversation.user_id |
| Role valid | role must be 'user' or 'assistant' |
| Content required | content cannot be empty |
| Max length | content <= 2000 characters (FR-035) |
| Tool calls format | tool_calls must be valid JSON array or null |

---

## Query Patterns

### Get User's Conversations
```sql
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.user_id = :user_id
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

### Get Conversation Messages (with limit)
```sql
SELECT * FROM messages
WHERE conversation_id = :conversation_id
ORDER BY created_at ASC
LIMIT :limit;
```

### Get Recent Messages for Context
```sql
SELECT * FROM (
    SELECT * FROM messages
    WHERE conversation_id = :conversation_id
    ORDER BY created_at DESC
    LIMIT :limit
) sub
ORDER BY created_at ASC;
```

---

## Data Retention

| Entity | Retention Policy |
|--------|------------------|
| Conversations | Indefinite (user can delete) |
| Messages | Indefinite (cascade delete with conversation) |

**Cascade Behavior**:
- Deleting a conversation deletes all its messages
- Deleting a user should NOT auto-delete conversations (soft reference)
