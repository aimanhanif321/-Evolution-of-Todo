"""Event models for Dapr pub/sub messaging."""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class TaskEventType(str, Enum):
    CREATED = "task.created"
    UPDATED = "task.updated"
    DELETED = "task.deleted"
    COMPLETED = "task.completed"
    RECURRED = "task.recurred"
    REMINDER = "task.reminder"


class UserEventType(str, Enum):
    LOGIN = "user.login"
    LOGOUT = "user.logout"
    REGISTERED = "user.registered"


class ChatEventType(str, Enum):
    MESSAGE_SENT = "chat.message_sent"
    RESPONSE_RECEIVED = "chat.response_received"


class BaseEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    user_id: str
    payload: dict[str, Any] = Field(default_factory=dict)


class TaskEvent(BaseEvent):
    event_type: TaskEventType

    @classmethod
    def created(cls, user_id: str, task_data: dict) -> "TaskEvent":
        """Create event for new task - includes priority, due_date, tags"""
        return cls(
            event_type=TaskEventType.CREATED,
            user_id=user_id,
            payload=task_data,
        )

    @classmethod
    def updated(cls, user_id: str, task_data: dict, changes: list[str] = None) -> "TaskEvent":
        """Update event with list of changed fields"""
        payload = {**task_data}
        if changes:
            payload["changes"] = changes
        return cls(
            event_type=TaskEventType.UPDATED,
            user_id=user_id,
            payload=payload,
        )

    @classmethod
    def deleted(cls, user_id: str, task_id: int) -> "TaskEvent":
        return cls(
            event_type=TaskEventType.DELETED,
            user_id=user_id,
            payload={"task_id": task_id},
        )

    @classmethod
    def completed(cls, user_id: str, task_id: int, completed: bool) -> "TaskEvent":
        """Event for task completion status change"""
        return cls(
            event_type=TaskEventType.COMPLETED,
            user_id=user_id,
            payload={"task_id": task_id, "completed": completed},
        )

    @classmethod
    def recurred(cls, user_id: str, original_task_id: int, new_task_id: int, next_due_date: str) -> "TaskEvent":
        """Event when recurring task generates next instance"""
        return cls(
            event_type=TaskEventType.RECURRED,
            user_id=user_id,
            payload={
                "original_task_id": original_task_id,
                "new_task_id": new_task_id,
                "next_due_date": next_due_date,
            },
        )

    @classmethod
    def reminder(cls, user_id: str, task_id: int, title: str, due_date: str, reminder_type: str = "custom") -> "TaskEvent":
        """Event when a reminder is due"""
        return cls(
            event_type=TaskEventType.REMINDER,
            user_id=user_id,
            payload={
                "task_id": task_id,
                "title": title,
                "due_date": due_date,
                "reminder_type": reminder_type,
            },
        )


class UserEvent(BaseEvent):
    event_type: UserEventType


class ChatEvent(BaseEvent):
    event_type: ChatEventType
    conversation_id: Optional[int] = None
