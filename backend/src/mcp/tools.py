"""
MCP Tools for Task Management

These tools are callable by the Gemini AI agent to perform task operations.
Each tool maps to existing task_service functions.
"""

from typing import Any, Optional, Callable
from datetime import datetime
from sqlmodel import Session

from ..database import engine
from ..services.task_service import (
    create_task as db_create_task,
    get_tasks as db_get_tasks,
    get_task as db_get_task,
    update_task as db_update_task,
    delete_task as db_delete_task,
    toggle_task_completion,
)
from ..models.task import TaskCreate, TaskUpdate


# ============================================================================
# Tool Schema Definitions (for Gemini function calling)
# ============================================================================

ADD_TASK_SCHEMA = {
    "name": "add_task",
    "description": "Add a new task to the user's todo list",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "The title of the task"
            },
            "description": {
                "type": "string",
                "description": "Optional description of the task"
            }
        },
        "required": ["title"]
    }
}

LIST_TASKS_SCHEMA = {
    "name": "list_tasks",
    "description": "Retrieve user's tasks with optional filtering by status",
    "parameters": {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["all", "pending", "completed"],
                "description": "Filter tasks by status. Default is 'all'"
            }
        },
        "required": []
    }
}

COMPLETE_TASK_SCHEMA = {
    "name": "complete_task",
    "description": "Mark a task as completed",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "integer",
                "description": "The ID of the task to complete"
            }
        },
        "required": ["task_id"]
    }
}

DELETE_TASK_SCHEMA = {
    "name": "delete_task",
    "description": "Remove a task from the user's list",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "integer",
                "description": "The ID of the task to delete"
            }
        },
        "required": ["task_id"]
    }
}

UPDATE_TASK_SCHEMA = {
    "name": "update_task",
    "description": "Modify an existing task's title or description",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "integer",
                "description": "The ID of the task to update"
            },
            "title": {
                "type": "string",
                "description": "New title for the task (optional)"
            },
            "description": {
                "type": "string",
                "description": "New description for the task (optional)"
            }
        },
        "required": ["task_id"]
    }
}

# Combined list of all tool schemas
TOOLS = [
    ADD_TASK_SCHEMA,
    LIST_TASKS_SCHEMA,
    COMPLETE_TASK_SCHEMA,
    DELETE_TASK_SCHEMA,
    UPDATE_TASK_SCHEMA,
]


# ============================================================================
# Tool Handler Functions
# ============================================================================

async def add_task_handler(user_id: str, title: str, description: Optional[str] = None) -> dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        user_id: The user's ID
        title: Task title
        description: Optional task description

    Returns:
        Dict with task_id, status, and title
    """
    with Session(engine) as session:
        task_data = TaskCreate(
            title=title,
            description=description,
            completed=False
        )
        task = db_create_task(session, task_data, user_id)
        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title
        }


async def list_tasks_handler(user_id: str, status: str = "all") -> dict[str, Any]:
    """
    Retrieve user's tasks with optional filtering.

    Args:
        user_id: The user's ID
        status: Filter - "all", "pending", or "completed"

    Returns:
        Dict with tasks list and count
    """
    with Session(engine) as session:
        # Map status to completed filter
        completed_filter = None
        if status == "pending":
            completed_filter = False
        elif status == "completed":
            completed_filter = True

        tasks = db_get_tasks(session, user_id, completed_filter)

        return {
            "tasks": [
                {
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat() if task.created_at else None
                }
                for task in tasks
            ],
            "count": len(tasks)
        }


async def complete_task_handler(user_id: str, task_id: int) -> dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        user_id: The user's ID
        task_id: The task ID to complete

    Returns:
        Dict with task_id, status, and title

    Raises:
        ValueError: If task not found or doesn't belong to user
    """
    with Session(engine) as session:
        # First check if task exists and belongs to user
        task = db_get_task(session, task_id, user_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")

        if task.completed:
            return {
                "task_id": task.id,
                "status": "already_completed",
                "title": task.title
            }

        # Mark as completed
        updated_task = toggle_task_completion(session, task_id, True, user_id)
        return {
            "task_id": updated_task.id,
            "status": "completed",
            "title": updated_task.title
        }


async def delete_task_handler(user_id: str, task_id: int) -> dict[str, Any]:
    """
    Remove a task from the user's list.

    Args:
        user_id: The user's ID
        task_id: The task ID to delete

    Returns:
        Dict with task_id, status, and title

    Raises:
        ValueError: If task not found or doesn't belong to user
    """
    with Session(engine) as session:
        # Get task first to return title
        task = db_get_task(session, task_id, user_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")

        task_title = task.title

        # Delete the task
        success = db_delete_task(session, task_id, user_id)
        if not success:
            raise ValueError(f"Failed to delete task {task_id}")

        return {
            "task_id": task_id,
            "status": "deleted",
            "title": task_title
        }


async def update_task_handler(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> dict[str, Any]:
    """
    Modify an existing task's title or description.

    Args:
        user_id: The user's ID
        task_id: The task ID to update
        title: New title (optional)
        description: New description (optional)

    Returns:
        Dict with task_id, status, and title

    Raises:
        ValueError: If task not found, doesn't belong to user, or no changes provided
    """
    if title is None and description is None:
        raise ValueError("No changes provided - specify title or description to update")

    with Session(engine) as session:
        # Check if task exists
        task = db_get_task(session, task_id, user_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")

        # Build update data
        update_data = TaskUpdate()
        if title is not None:
            update_data.title = title
        if description is not None:
            update_data.description = description

        # Update the task
        updated_task = db_update_task(session, task_id, update_data, user_id)

        return {
            "task_id": updated_task.id,
            "status": "updated",
            "title": updated_task.title
        }


# Map tool names to handler functions
TOOL_HANDLERS: dict[str, Callable] = {
    "add_task": add_task_handler,
    "list_tasks": list_tasks_handler,
    "complete_task": complete_task_handler,
    "delete_task": delete_task_handler,
    "update_task": update_task_handler,
}


# ============================================================================
# Tool Execution Dispatcher
# ============================================================================

async def execute_tool(tool_name: str, user_id: str, params: dict[str, Any]) -> dict[str, Any]:
    """
    Execute a tool by name with given parameters.

    Args:
        tool_name: Name of the tool to execute
        user_id: The user's ID (injected, not from AI)
        params: Tool parameters from AI

    Returns:
        Tool execution result

    Raises:
        ValueError: If tool not found
    """
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        raise ValueError(f"Unknown tool: {tool_name}")

    # Execute handler with user_id and params
    return await handler(user_id=user_id, **params)
