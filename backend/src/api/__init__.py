"""
API Routers for Taskora

Phase II:
- auth_router: Authentication endpoints
- task_router: Task CRUD endpoints

Phase III:
- chat_router: AI chatbot endpoints
"""

from . import auth_router
from . import task_router
from . import chat_router

__all__ = ["auth_router", "task_router", "chat_router"]
