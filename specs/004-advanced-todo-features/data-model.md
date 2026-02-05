# Data Model: Advanced Todo Features

**Feature**: 004-advanced-todo-features
**Date**: 2026-01-29

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          TASK                                │
├─────────────────────────────────────────────────────────────┤
│ id: int (PK)                                                │
│ title: str (required)                                       │
│ description: str (nullable)                                 │
│ completed: bool (default: false)                            │
│ user_id: str (required, indexed)                            │
│ priority: enum (low|medium|high|urgent, default: medium)    │
│ due_date: datetime (nullable)                               │
│ reminder_at: datetime (nullable)                            │
│ reminder_sent: bool (default: false)                        │
│ is_recurring: bool (default: false)                         │
│ recurrence_rule: enum (daily|weekly|monthly|custom, nullable)│
│ recurrence_interval: int (nullable)                         │
│ parent_task_id: int (FK → tasks.id, nullable)               │
│ created_at: datetime (auto)                                 │
│ updated_at: datetime (auto)                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ many-to-many
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       TASK_TAG                               │
├─────────────────────────────────────────────────────────────┤
│ task_id: int (FK → tasks.id, PK)                            │
│ tag_id: int (FK → tags.id, PK)                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                          TAG                                 │
├─────────────────────────────────────────────────────────────┤
│ id: int (PK)                                                │
│ name: str (required, max 50)                                │
│ color: str (hex color, default: #6366F1)                    │
│ user_id: str (required, indexed)                            │
│ created_at: datetime (auto)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Entities

### Task (Updated)

**Purpose**: Core entity representing a user's task

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique identifier |
| title | str | NOT NULL, max 255 | Task title |
| description | str | nullable | Task details |
| completed | bool | NOT NULL, default false | Completion status |
| user_id | str | NOT NULL, indexed | Owner (from auth) |
| priority | enum | NOT NULL, default 'medium' | low/medium/high/urgent |
| due_date | datetime | nullable | Deadline with timezone |
| reminder_at | datetime | nullable | When to send notification |
| reminder_sent | bool | NOT NULL, default false | Notification sent flag |
| is_recurring | bool | NOT NULL, default false | Recurrence enabled |
| recurrence_rule | enum | nullable | daily/weekly/monthly/custom |
| recurrence_interval | int | nullable | Days for custom recurrence |
| parent_task_id | int | FK → tasks.id, nullable | Parent for recurring instances |
| created_at | datetime | NOT NULL, auto | Creation timestamp |
| updated_at | datetime | NOT NULL, auto | Last update timestamp |

**Relationships**:
- Has many Tags through TaskTag (many-to-many)
- Self-referential: parent_task_id → Task (for recurring task lineage)

**Validation Rules**:
- title: 1-255 characters
- priority: must be valid enum value
- recurrence_interval: required if recurrence_rule is 'custom', must be > 0
- reminder_at: must be before or equal to due_date

---

### Tag (New)

**Purpose**: User-defined category for task organization

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique identifier |
| name | str | NOT NULL, max 50 | Tag label |
| color | str | NOT NULL, default '#6366F1' | Hex color code |
| user_id | str | NOT NULL, indexed | Owner (from auth) |
| created_at | datetime | NOT NULL, auto | Creation timestamp |

**Relationships**:
- Has many Tasks through TaskTag (many-to-many)

**Validation Rules**:
- name: 1-50 characters, unique per user (case-insensitive)
- color: valid hex color format (#RRGGBB)

---

### TaskTag (New)

**Purpose**: Junction table for Task-Tag many-to-many relationship

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| task_id | int | PK, FK → tasks.id | Task reference |
| tag_id | int | PK, FK → tags.id | Tag reference |

**Cascade Rules**:
- ON DELETE task: CASCADE (remove all task_tag entries)
- ON DELETE tag: CASCADE (remove all task_tag entries)

---

## Enums

### Priority

```python
class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"
```

**Sort Order** (for priority sorting):
- urgent: 0 (highest)
- high: 1
- medium: 2
- low: 3 (lowest)

### RecurrenceRule

```python
class RecurrenceRule(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    custom = "custom"
```

---

## Indexes

```sql
-- Existing indexes preserved
-- idx_tasks_user_id (if not exists)

-- New indexes for Phase VI
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_reminder ON tasks(reminder_at) WHERE reminder_sent = FALSE;
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_tags_user_name ON tags(user_id, LOWER(name));
```

---

## SQLModel Definitions

### Task Model

```python
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .tag import Tag

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class RecurrenceRule(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    custom = "custom"

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: Priority = Priority.medium
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[RecurrenceRule] = None
    recurrence_interval: Optional[int] = None

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(sa_column=Column(String, nullable=False, index=True))
    reminder_sent: bool = Field(default=False)
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    # Relationships
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model="TaskTag")
    parent_task: Optional["Task"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Task.id"}
    )

class TaskCreate(TaskBase):
    tag_ids: List[int] = []

class TaskRead(TaskBase):
    id: int
    user_id: str
    reminder_sent: bool
    parent_task_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    tags: List["TagRead"] = []

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[RecurrenceRule] = None
    recurrence_interval: Optional[int] = None
    tag_ids: Optional[List[int]] = None
```

### Tag Model

```python
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .task import Task

class TagBase(SQLModel):
    name: str = Field(max_length=50)
    color: str = Field(default="#6366F1", max_length=7)

class Tag(TagBase, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(sa_column=Column(String, nullable=False, index=True))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="tags", link_model="TaskTag")

class TagCreate(TagBase):
    pass

class TagRead(TagBase):
    id: int
    user_id: str
    created_at: datetime

class TagUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)

class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
```

---

## Migration Script

```python
"""Phase VI: Advanced Todo Features

Revision ID: 001_phase_vi_features
Create Date: 2026-01-29
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(10), nullable=False, server_default='medium'))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('reminder_sent', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tasks', sa.Column('recurrence_rule', sa.String(20), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_interval', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('parent_task_id', sa.Integer(), sa.ForeignKey('tasks.id'), nullable=True))

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('color', sa.String(7), nullable=False, server_default='#6366F1'),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )

    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
    )

    # Create indexes
    op.create_index('idx_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_tasks_user_due_date', 'tasks', ['user_id', 'due_date'])
    op.create_index('idx_tasks_reminder', 'tasks', ['reminder_at'], postgresql_where=sa.text('reminder_sent = false'))
    op.create_index('idx_tags_user', 'tags', ['user_id'])

def downgrade():
    # Drop indexes
    op.drop_index('idx_tags_user')
    op.drop_index('idx_tasks_reminder')
    op.drop_index('idx_tasks_user_due_date')
    op.drop_index('idx_tasks_user_priority')

    # Drop tables
    op.drop_table('task_tags')
    op.drop_table('tags')

    # Remove columns
    op.drop_column('tasks', 'parent_task_id')
    op.drop_column('tasks', 'recurrence_interval')
    op.drop_column('tasks', 'recurrence_rule')
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'reminder_sent')
    op.drop_column('tasks', 'reminder_at')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```
