"""Task-specific event publishing for Dapr pub/sub.

This module provides functions to emit task lifecycle events.
Events are published to Dapr pub/sub when available, and also
directly to SSE connections for immediate frontend updates.
"""

import logging
from typing import Any

from src.dapr.publisher import publish_task_event
from src.models.events import TaskEvent

logger = logging.getLogger(__name__)


async def _emit_to_sse(user_id: str, event_type: str, payload: dict) -> bool:
    """Emit event directly to SSE connections (fallback for non-Dapr mode).

    This provides immediate frontend updates even when Dapr is not available.
    """
    try:
        from src.api.events_router import emit_sse_event
        return await emit_sse_event(user_id, event_type, payload)
    except ImportError:
        logger.debug("SSE router not available, skipping direct emit")
        return False
    except Exception as e:
        logger.warning(f"Failed to emit to SSE: {e}")
        return False


async def emit_task_created(user_id: str, task_id: int, task_data: dict[str, Any]) -> bool:
    """Emit an event when a task is created.

    Args:
        user_id: The ID of the user who created the task
        task_id: The ID of the newly created task
        task_data: Task data including title, description, etc.

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "task_id": task_id,
        **task_data,
    }
    event = TaskEvent.created(user_id=user_id, task_data=payload)

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.created", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.created event for task {task_id} (dapr={dapr_result}, sse={sse_result})")
    return result


async def emit_task_updated(user_id: str, task_id: int, task_data: dict[str, Any]) -> bool:
    """Emit an event when a task is updated.

    Args:
        user_id: The ID of the user who updated the task
        task_id: The ID of the updated task
        task_data: Updated task data

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "task_id": task_id,
        **task_data,
    }
    event = TaskEvent.updated(user_id=user_id, task_data=payload)

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.updated", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.updated event for task {task_id} (dapr={dapr_result}, sse={sse_result})")
    return result


async def emit_task_deleted(user_id: str, task_id: int) -> bool:
    """Emit an event when a task is deleted.

    Args:
        user_id: The ID of the user who deleted the task
        task_id: The ID of the deleted task

    Returns:
        True if event was published successfully, False otherwise
    """
    event = TaskEvent.deleted(user_id=user_id, task_id=task_id)
    payload = {"task_id": task_id}

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.deleted", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.deleted event for task {task_id} (dapr={dapr_result}, sse={sse_result})")
    return result


async def emit_task_completed(user_id: str, task_id: int, completed: bool) -> bool:
    """Emit an event when a task's completion status changes.

    Args:
        user_id: The ID of the user who changed the status
        task_id: The ID of the task
        completed: New completion status

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "task_id": task_id,
        "completed": completed,
        "status_change": "completed" if completed else "reopened",
    }
    event = TaskEvent.updated(user_id=user_id, task_data=payload)

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.completed", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.completed event for task {task_id} (dapr={dapr_result}, sse={sse_result})")
    return result


async def emit_task_recurred(
    user_id: str,
    original_task_id: int,
    new_task_id: int,
    next_due_date: str | None
) -> bool:
    """Emit an event when a recurring task creates a new instance.

    Args:
        user_id: The ID of the user
        original_task_id: The ID of the completed task
        new_task_id: The ID of the newly created task instance
        next_due_date: The due date for the new task instance

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "original_task_id": original_task_id,
        "new_task_id": new_task_id,
        "next_due_date": next_due_date,
    }
    event = TaskEvent.recurred(
        user_id=user_id,
        original_task_id=original_task_id,
        new_task_id=new_task_id,
        next_due_date=next_due_date or ""
    )

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.recurred", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.recurred event: {original_task_id} -> {new_task_id} (dapr={dapr_result}, sse={sse_result})")
    return result


async def emit_task_reminder(
    user_id: str,
    task_id: int,
    title: str,
    due_date: str | None
) -> bool:
    """Emit an event when a task reminder is triggered.

    Args:
        user_id: The ID of the user
        task_id: The ID of the task with the reminder
        title: The task title
        due_date: The task's due date (ISO format)

    Returns:
        True if event was published successfully, False otherwise
    """
    payload = {
        "task_id": task_id,
        "title": title,
        "due_date": due_date,
    }
    event = TaskEvent.reminder(
        user_id=user_id,
        task_id=task_id,
        title=title,
        due_date=due_date or ""
    )

    # Publish to Dapr pub/sub
    dapr_result = await publish_task_event(event)

    # Also emit directly to SSE for immediate updates
    sse_result = await _emit_to_sse(user_id, "task.reminder", payload)

    result = dapr_result or sse_result
    if result:
        logger.info(f"Emitted task.reminder event for task {task_id} (dapr={dapr_result}, sse={sse_result})")
    return result
