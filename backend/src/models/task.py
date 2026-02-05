from enum import Enum
from sqlmodel import SQLModel, Field, Column, DateTime, String, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

# Import TaskTag for link_model (must be actual class, not string)
from .tag import TaskTag

if TYPE_CHECKING:
    from .tag import Tag, TagRead


class Priority(str, Enum):
    """Task priority levels with sort order: urgent(0) > high(1) > medium(2) > low(3)"""
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class RecurrenceRule(str, Enum):
    """Recurrence patterns for recurring tasks"""
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    custom = "custom"  # Uses recurrence_interval for custom day count

class TaskBase(SQLModel):
    """Base fields shared across Task schemas"""
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
    """Task database model with all Phase VI fields"""
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
    tags: List["Tag"] = Relationship(
        back_populates="tasks",
        link_model=TaskTag
    )

class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    tag_ids: List[int] = Field(default_factory=list)


class TaskRead(TaskBase):
    """Schema for reading a task with all fields"""
    id: int
    user_id: str
    reminder_sent: bool
    parent_task_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    tags: List["TagRead"] = Field(default_factory=list)


class TaskUpdate(SQLModel):
    """Schema for updating a task - all fields optional"""
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