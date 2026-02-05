"""Chat-specific event publishing for Dapr pub/sub."""

import logging
from typing import Any, Optional

from src.dapr.publisher import publish_chat_event
from src.models.events import ChatEvent, ChatEventType

logger = logging.getLogger(__name__)


async def emit_chat_message_sent(
    user_id: str,
    conversation_id: int,
    message: str,
    metadata: Optional[dict[str, Any]] = None
) -> bool:
    """Emit an event when a user sends a chat message.

    Args:
        user_id: The ID of the user who sent the message
        conversation_id: The conversation ID
        message: The message content (may be truncated for privacy)
        metadata: Optional metadata

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "message_length": len(message),
        "message_preview": message[:100] if len(message) > 100 else message,
        **(metadata or {}),
    }
    event = ChatEvent(
        event_type=ChatEventType.MESSAGE_SENT,
        user_id=user_id,
        conversation_id=conversation_id,
        payload=payload,
    )

    result = await publish_chat_event(event)
    if result:
        logger.info(f"Emitted chat.message_sent event for conversation {conversation_id}")
    return result


async def emit_chat_response_received(
    user_id: str,
    conversation_id: int,
    response_length: int,
    model: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None
) -> bool:
    """Emit an event when an AI response is received.

    Args:
        user_id: The ID of the user who received the response
        conversation_id: The conversation ID
        response_length: Length of the AI response
        model: The AI model used (e.g., "gemini-pro")
        metadata: Optional metadata (latency, tokens, etc.)

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "response_length": response_length,
        "model": model,
        **(metadata or {}),
    }
    event = ChatEvent(
        event_type=ChatEventType.RESPONSE_RECEIVED,
        user_id=user_id,
        conversation_id=conversation_id,
        payload=payload,
    )

    result = await publish_chat_event(event)
    if result:
        logger.info(f"Emitted chat.response_received event for conversation {conversation_id}")
    return result
