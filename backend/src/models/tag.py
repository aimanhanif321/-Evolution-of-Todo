"""Tag model for task categorization (Phase VI)"""

from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .task import Task


class TaskTag(SQLModel, table=True):
    """Junction table for Task-Tag many-to-many relationship"""
    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class TagBase(SQLModel):
    """Base fields shared across Tag schemas"""
    name: str = Field(max_length=50)
    color: str = Field(default="#6366F1", max_length=7)


class Tag(TagBase, table=True):
    """Tag database model for user-defined task categories"""
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(sa_column=Column(String, nullable=False, index=True))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTag
    )


class TagCreate(TagBase):
    """Schema for creating a new tag"""
    pass


class TagRead(TagBase):
    """Schema for reading a tag with all fields"""
    id: int
    user_id: str
    created_at: datetime


class TagUpdate(SQLModel):
    """Schema for updating a tag - all fields optional"""
    name: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)
