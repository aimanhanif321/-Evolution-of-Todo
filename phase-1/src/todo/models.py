"""Task model for the Todo CLI application."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Task:
    """Represents a single task in the todo list.

    Attributes:
        id: Unique positive integer identifier assigned at creation.
        content: Non-empty text string describing the task.
        is_complete: Boolean indicating whether the task is complete.
    """

    id: int
    content: str
    is_complete: bool
