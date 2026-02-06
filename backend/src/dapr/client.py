"""Dapr client wrapper for service invocation and pub/sub.

Provides graceful degradation when Dapr sidecar is unavailable.
All operations are non-blocking and fail silently when Dapr is not running.
"""

import json
import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
PUBSUB_NAME = os.getenv("DAPR_PUBSUB_NAME", "taskora-pubsub")

# Topics
TOPIC_TASK_EVENTS = "task-events"
TOPIC_USER_EVENTS = "user-events"
TOPIC_CHAT_EVENTS = "chat-events"
TOPIC_REMINDER_EVENTS = "reminder-events"
TOPIC_SYSTEM_EVENTS = "system-events"


@lru_cache(maxsize=1)
def _is_dapr_enabled() -> bool:
    """Check if Dapr is enabled via environment variable."""
    return os.getenv("DAPR_ENABLED", "true").lower() in ("true", "1", "yes")


def _is_dapr_available() -> bool:
    """Check if Dapr sidecar is available.

    Returns True only if:
    1. DAPR_ENABLED is not explicitly set to false
    2. DAPR_HTTP_PORT environment variable is set (indicates sidecar is running)
    """
    if not _is_dapr_enabled():
        return False
    return os.getenv("DAPR_HTTP_PORT") is not None


def is_dapr_healthy() -> bool:
    """Check if Dapr sidecar is healthy and responding.

    This performs an actual health check against the Dapr sidecar.
    Use sparingly as it makes a network call.
    """
    if not _is_dapr_available():
        return False

    try:
        import httpx

        response = httpx.get(f"{DAPR_BASE_URL}/v1.0/healthz", timeout=2.0)
        return response.status_code == 200
    except Exception:
        return False


async def publish_event(topic: str, data: dict) -> bool:
    """Publish an event to a Dapr pub/sub topic.

    Returns True if published successfully, False otherwise.
    Fails gracefully when Dapr is not available.
    """
    if not _is_dapr_available():
        logger.debug("Dapr sidecar not available, skipping event publish")
        return False

    try:
        from dapr.clients import DaprClient

        with DaprClient() as client:
            client.publish_event(
                pubsub_name=PUBSUB_NAME,
                topic_name=topic,
                data=json.dumps(data),
                data_content_type="application/json",
            )
        logger.info(f"Published event to {topic}: {data.get('event_type', 'unknown')}")
        return True
    except Exception as e:
        logger.warning(f"Failed to publish event to {topic}: {e}")
        return False


async def invoke_service(app_id: str, method: str, data: dict) -> dict | None:
    """Invoke another service via Dapr sidecar.

    Returns response data or None on failure.
    """
    if not _is_dapr_available():
        logger.debug("Dapr sidecar not available, skipping service invocation")
        return None

    try:
        from dapr.clients import DaprClient

        with DaprClient() as client:
            response = client.invoke_method(
                app_id=app_id,
                method_name=method,
                data=json.dumps(data),
                content_type="application/json",
            )
        return json.loads(response.data) if response.data else {}
    except Exception as e:
        logger.warning(f"Failed to invoke {app_id}/{method}: {e}")
        return None
