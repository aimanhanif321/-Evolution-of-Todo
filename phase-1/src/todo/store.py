"""In-memory task store for state management."""

from todo.models import Task


class TaskStore:
    """Manages task state in memory during the application session.

    Provides deterministic task management with sequential ID assignment.
    All operations maintain data integrity and provide clear error feedback.
    """

    def __init__(self) -> None:
        """Initialize an empty task store with sequential ID counter."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, content: str) -> Task:
        """Add a new task with the given content.

        Args:
            content: The task description (must be non-empty).

        Returns:
            The newly created Task.

        Raises:
            ValueError: If content is empty or whitespace-only.
        """
        if not content or not content.strip():
            raise ValueError("Task content cannot be empty.")

        task_id = self._next_id
        self._next_id += 1

        task = Task(id=task_id, content=content.strip(), is_complete=False)
        self._tasks[task_id] = task
        return task

    def delete(self, task_id: int) -> None:
        """Delete a task by its ID.

        Args:
            task_id: The ID of the task to delete.

        Raises:
            KeyError: If no task with the given ID exists.
        """
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id} not found.")
        del self._tasks[task_id]

    def update(self, task_id: int, content: str) -> Task:
        """Update a task's content.

        Args:
            task_id: The ID of the task to update.
            content: The new task description (must be non-empty).

        Returns:
            The updated Task.

        Raises:
            KeyError: If no task with the given ID exists.
            ValueError: If content is empty or whitespace-only.
        """
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id} not found.")
        if not content or not content.strip():
            raise ValueError("Task content cannot be empty.")

        existing = self._tasks[task_id]
        updated = Task(id=existing.id, content=content.strip(), is_complete=existing.is_complete)
        self._tasks[task_id] = updated
        return updated

    def mark_complete(self, task_id: int) -> Task:
        """Mark a task as complete.

        Args:
            task_id: The ID of the task to mark complete.

        Returns:
            The updated Task.

        Raises:
            KeyError: If no task with the given ID exists.
        """
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id} not found.")

        existing = self._tasks[task_id]
        updated = Task(id=existing.id, content=existing.content, is_complete=True)
        self._tasks[task_id] = updated
        return updated

    def mark_incomplete(self, task_id: int) -> Task:
        """Mark a task as incomplete.

        Args:
            task_id: The ID of the task to mark incomplete.

        Returns:
            The updated Task.

        Raises:
            KeyError: If no task with the given ID exists.
        """
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id} not found.")

        existing = self._tasks[task_id]
        updated = Task(id=existing.id, content=existing.content, is_complete=False)
        self._tasks[task_id] = updated
        return updated

    def get_all(self) -> list[Task]:
        """Get all tasks as a sorted list.

        Returns:
            List of all tasks sorted by ID in ascending order.
        """
        return sorted(self._tasks.values(), key=lambda t: t.id)

    def get(self, task_id: int) -> Task | None:
        """Get a task by ID.

        Args:
            task_id: The ID of the task to retrieve.

        Returns:
            The Task if found, None otherwise.
        """
        return self._tasks.get(task_id)

    def count(self) -> int:
        """Return the number of tasks in the store.

        Returns:
            The count of tasks.
        """
        return len(self._tasks)
