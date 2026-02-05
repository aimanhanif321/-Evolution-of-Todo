"""User-specific event publishing for Dapr pub/sub."""

import logging
from typing import Any, Optional

from src.dapr.publisher import publish_user_event
from src.models.events import UserEvent, UserEventType

logger = logging.getLogger(__name__)


async def emit_user_login(user_id: str, metadata: Optional[dict[str, Any]] = None) -> bool:
    """Emit an event when a user logs in.

    Args:
        user_id: The ID of the user who logged in
        metadata: Optional metadata (ip, user_agent, etc.)

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = metadata or {}
    event = UserEvent(
        event_type=UserEventType.LOGIN,
        user_id=user_id,
        payload=payload,
    )

    result = await publish_user_event(event)
    if result:
        logger.info(f"Emitted user.login event for user {user_id}")
    return result


async def emit_user_logout(user_id: str, metadata: Optional[dict[str, Any]] = None) -> bool:
    """Emit an event when a user logs out.

    Args:
        user_id: The ID of the user who logged out
        metadata: Optional metadata

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = metadata or {}
    event = UserEvent(
        event_type=UserEventType.LOGOUT,
        user_id=user_id,
        payload=payload,
    )

    result = await publish_user_event(event)
    if result:
        logger.info(f"Emitted user.logout event for user {user_id}")
    return result


async def emit_user_registered(
    user_id: str,
    email: str,
    metadata: Optional[dict[str, Any]] = None
) -> bool:
    """Emit an event when a new user registers.

    Args:
        user_id: The ID of the newly registered user
        email: The user's email address
        metadata: Optional metadata

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "email": email,
        **(metadata or {}),
    }
    event = UserEvent(
        event_type=UserEventType.REGISTERED,
        user_id=user_id,
        payload=payload,
    )

    result = await publish_user_event(event)
    if result:
        logger.info(f"Emitted user.registered event for user {user_id}")
    return result
