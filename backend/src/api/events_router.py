"""Server-Sent Events (SSE) endpoint for real-time updates.

This module provides:
1. SSE endpoint for clients to subscribe to real-time task events
2. Dapr subscription endpoint to receive events from Kafka/Redpanda
3. Event broadcasting to connected SSE clients
"""

import asyncio
import json
import logging
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..dependencies.auth_dependencies import get_current_user_sse

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory store of active SSE connections per user
# In production, use Redis pub/sub for multi-instance support
_user_connections: dict[str, set[asyncio.Queue]] = defaultdict(set)


class TaskEventPayload(BaseModel):
    """Payload received from Dapr pub/sub."""
    event_id: str
    event_type: str
    timestamp: str
    user_id: str
    payload: dict


async def broadcast_to_user(user_id: str, event_data: dict) -> int:
    """Broadcast an event to all SSE connections for a user.

    Returns the number of connections that received the event.
    """
    connections = _user_connections.get(user_id, set())
    if not connections:
        return 0

    sent_count = 0
    dead_connections = []

    for queue in connections:
        try:
            await asyncio.wait_for(queue.put(event_data), timeout=1.0)
            sent_count += 1
        except asyncio.TimeoutError:
            dead_connections.append(queue)
        except Exception as e:
            logger.warning(f"Failed to send event to connection: {e}")
            dead_connections.append(queue)

    # Clean up dead connections
    for queue in dead_connections:
        connections.discard(queue)

    return sent_count


async def event_generator(
    request: Request,
    user_id: str
) -> AsyncGenerator[str, None]:
    """Generate SSE events for a connected client."""
    queue: asyncio.Queue = asyncio.Queue()
    _user_connections[user_id].add(queue)

    connection_id = str(uuid.uuid4())[:8]
    logger.info(f"SSE connection opened: user={user_id}, conn={connection_id}")

    try:
        # Send initial connection event
        yield f"event: connected\ndata: {json.dumps({'connection_id': connection_id, 'user_id': user_id})}\n\n"

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            try:
                # Wait for events with timeout for keepalive
                event_data = await asyncio.wait_for(queue.get(), timeout=30.0)

                event_type = event_data.get("event_type", "message")
                yield f"event: {event_type}\ndata: {json.dumps(event_data)}\n\n"

            except asyncio.TimeoutError:
                # Send keepalive comment
                yield ": keepalive\n\n"

    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.error(f"SSE error: {e}")
    finally:
        _user_connections[user_id].discard(queue)
        logger.info(f"SSE connection closed: user={user_id}, conn={connection_id}")


@router.get("/events/stream")
async def sse_stream(
    request: Request,
    current_user_id: str = Depends(get_current_user_sse)
):
    """Server-Sent Events endpoint for real-time task updates.

    Clients connect to this endpoint to receive real-time notifications
    when tasks are created, updated, deleted, or completed.

    Event types:
    - connected: Initial connection confirmation
    - task.created: New task created
    - task.updated: Task modified
    - task.deleted: Task removed
    - task.completed: Task completion status changed
    - task.recurred: Recurring task generated new instance
    - task.reminder: Task reminder triggered

    The connection sends keepalive comments every 30 seconds to prevent
    proxy timeouts.
    """
    return StreamingResponse(
        event_generator(request, current_user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


@router.get("/events/stats")
async def get_connection_stats():
    """Get SSE connection statistics (for debugging/monitoring)."""
    stats = {
        "total_users": len(_user_connections),
        "total_connections": sum(len(conns) for conns in _user_connections.values()),
        "users": {
            user_id: len(conns)
            for user_id, conns in _user_connections.items()
            if conns
        }
    }
    return stats


# -----------------------------------------
# Dapr Subscription Endpoints
# -----------------------------------------

@router.get("/dapr/subscribe")
async def dapr_subscribe():
    """Dapr programmatic subscription endpoint.

    Returns the list of topics this service subscribes to.
    Called by Dapr sidecar to discover subscriptions.
    """
    return [
        {
            "pubsubname": "taskora-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-event",
            "metadata": {
                "rawPayload": "true"
            }
        },
        {
            "pubsubname": "taskora-pubsub",
            "topic": "reminder-events",
            "route": "/api/events/reminder-event",
            "metadata": {
                "rawPayload": "true"
            }
        }
    ]


@router.post("/events/task-event")
async def handle_task_event(request: Request):
    """Handle incoming task events from Dapr pub/sub.

    This endpoint receives CloudEvents from the Dapr sidecar and
    broadcasts them to connected SSE clients.
    """
    try:
        # Parse CloudEvent from Dapr
        body = await request.json()

        # Extract event data (Dapr wraps it in CloudEvents format)
        event_data = body.get("data", body)

        if not event_data:
            logger.warning("Received empty event data")
            return {"status": "ignored", "reason": "empty data"}

        # Get user_id to route the event
        user_id = event_data.get("user_id")
        if not user_id:
            logger.warning("Event missing user_id, cannot route")
            return {"status": "ignored", "reason": "missing user_id"}

        # Broadcast to user's SSE connections
        sent_count = await broadcast_to_user(user_id, event_data)

        logger.info(
            f"Processed task event: type={event_data.get('event_type')}, "
            f"user={user_id}, sent_to={sent_count} connections"
        )

        return {"status": "success", "sent_to": sent_count}

    except Exception as e:
        logger.error(f"Error processing task event: {e}")
        return {"status": "error", "message": str(e)}


@router.post("/events/reminder-event")
async def handle_reminder_event(request: Request):
    """Handle incoming reminder events from Dapr pub/sub.

    Similar to task events but specifically for reminders.
    """
    try:
        body = await request.json()
        event_data = body.get("data", body)

        if not event_data:
            return {"status": "ignored", "reason": "empty data"}

        user_id = event_data.get("user_id")
        if not user_id:
            return {"status": "ignored", "reason": "missing user_id"}

        # Add event_type if not present
        if "event_type" not in event_data:
            event_data["event_type"] = "task.reminder"

        sent_count = await broadcast_to_user(user_id, event_data)

        logger.info(
            f"Processed reminder event: user={user_id}, sent_to={sent_count} connections"
        )

        return {"status": "success", "sent_to": sent_count}

    except Exception as e:
        logger.error(f"Error processing reminder event: {e}")
        return {"status": "error", "message": str(e)}


# -----------------------------------------
# Direct Event Trigger (for non-Dapr mode)
# -----------------------------------------

async def emit_sse_event(user_id: str, event_type: str, payload: dict) -> bool:
    """Emit an event directly to SSE connections (bypasses Dapr).

    Use this when Dapr is not available or for testing.

    Args:
        user_id: Target user's ID
        event_type: Type of event (e.g., "task.created")
        payload: Event payload data

    Returns:
        True if at least one connection received the event
    """
    event_data = {
        "event_id": str(uuid.uuid4()),
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "payload": payload
    }

    sent_count = await broadcast_to_user(user_id, event_data)
    return sent_count > 0
