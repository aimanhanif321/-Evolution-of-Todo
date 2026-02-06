"""Dapr integration module for Taskora.

This module provides:
- Event publishing to Kafka/Redpanda via Dapr pub/sub
- Service invocation between microservices
- Graceful degradation when Dapr is unavailable

Usage:
    from src.dapr.task_events import emit_task_created, emit_task_updated, emit_task_deleted
    from src.dapr.user_events import emit_user_login, emit_user_registered
    from src.dapr.chat_events import emit_chat_message_sent, emit_chat_response_received
"""

from src.dapr.client import (
    PUBSUB_NAME,
    TOPIC_CHAT_EVENTS,
    TOPIC_TASK_EVENTS,
    TOPIC_USER_EVENTS,
    is_dapr_healthy,
    invoke_service,
    publish_event,
)
from src.dapr.publisher import (
    publish_chat_event,
    publish_task_event,
    publish_user_event,
)

__all__ = [
    # Client
    "PUBSUB_NAME",
    "TOPIC_TASK_EVENTS",
    "TOPIC_USER_EVENTS",
    "TOPIC_CHAT_EVENTS",
    "publish_event",
    "invoke_service",
    "is_dapr_healthy",
    # Publisher
    "publish_task_event",
    "publish_user_event",
    "publish_chat_event",
]
