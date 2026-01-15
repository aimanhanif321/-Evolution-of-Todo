"""
MCP (Model Context Protocol) Tools Module

This module provides AI-callable tools for task management operations.
Tools are designed to be invoked by the Gemini AI agent.

Available tools:
- add_task: Create a new task
- list_tasks: Retrieve user's tasks with optional filtering
- complete_task: Mark a task as completed
- delete_task: Remove a task
- update_task: Modify task title or description
"""

from .tools import (
    TOOLS,
    TOOL_HANDLERS,
    execute_tool,
    # Individual tool schemas
    ADD_TASK_SCHEMA,
    LIST_TASKS_SCHEMA,
    COMPLETE_TASK_SCHEMA,
    DELETE_TASK_SCHEMA,
    UPDATE_TASK_SCHEMA,
    # Individual handlers
    add_task_handler,
    list_tasks_handler,
    complete_task_handler,
    delete_task_handler,
    update_task_handler,
)

__all__ = [
    "TOOLS",
    "TOOL_HANDLERS",
    "execute_tool",
    "ADD_TASK_SCHEMA",
    "LIST_TASKS_SCHEMA",
    "COMPLETE_TASK_SCHEMA",
    "DELETE_TASK_SCHEMA",
    "UPDATE_TASK_SCHEMA",
    "add_task_handler",
    "list_tasks_handler",
    "complete_task_handler",
    "delete_task_handler",
    "update_task_handler",
]
