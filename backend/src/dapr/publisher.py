"""Event publisher for Dapr pub/sub topics."""

import logging

from src.dapr.client import (
    TOPIC_CHAT_EVENTS,
    TOPIC_TASK_EVENTS,
    TOPIC_USER_EVENTS,
    publish_event,
)
from src.models.events import BaseEvent, ChatEvent, TaskEvent, UserEvent

logger = logging.getLogger(__name__)


async def publish_task_event(event: TaskEvent) -> bool:
    """Publish a task lifecycle event."""
    return await publish_event(TOPIC_TASK_EVENTS, event.model_dump())


async def publish_user_event(event: UserEvent) -> bool:
    """Publish a user activity event."""
    return await publish_event(TOPIC_USER_EVENTS, event.model_dump())


async def publish_chat_event(event: ChatEvent) -> bool:
    """Publish a chat conversation event."""
    return await publish_event(TOPIC_CHAT_EVENTS, event.model_dump())
