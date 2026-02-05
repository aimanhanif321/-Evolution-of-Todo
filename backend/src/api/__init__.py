"""
API Routers for Taskora

Phase II:
- auth_router: Authentication endpoints
- task_router: Task CRUD endpoints

Phase III:
- chat_router: AI chatbot endpoints

Phase VI:
- tag_router: Tag CRUD endpoints

Phase V:
- events_router: SSE streaming and Dapr subscriptions
"""

from . import auth_router
from . import task_router
from . import chat_router
from . import tag_router
from . import events_router

__all__ = ["auth_router", "task_router", "chat_router", "tag_router", "events_router"]
