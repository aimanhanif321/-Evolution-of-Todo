"""Command-line interface for the Todo CLI application."""

import sys

from todo.models import Task
from todo.store import TaskStore


def cmd_add(store: TaskStore, args: list[str]) -> None:
    """Add a new task.

    Usage: add <task description>
    """
    if not args:
        print("Error: Task content cannot be empty.", file=sys.stderr)
        return

    content = " ".join(args)
    if not content.strip():
        print("Error: Task content cannot be empty or whitespace-only.", file=sys.stderr)
        return

    try:
        task = store.add(content)
        print(f"Task {task.id} added: {task.content}")
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)


def cmd_list(store: TaskStore) -> None:
    """List all tasks.

    Usage: list
    """
    tasks = store.get_all()

    if not tasks:
        print("No tasks yet. Add one with 'add <description>'.")
        return

    # Header
    print(f"{'ID':<4} {'Status':<12} Description")
    print("-" * 60)

    for task in tasks:
        status = "[x]" if task.is_complete else "[ ]"
        print(f"{task.id:<4} {status:<12} {task.content}")


def cmd_complete(store: TaskStore, args: list[str]) -> None:
    """Mark a task as complete.

    Usage: complete <task_id>
    """
    if not args:
        print("Error: Task ID required.", file=sys.stderr)
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Error: Invalid task ID. Must be a number.", file=sys.stderr)
        return

    try:
        task = store.mark_complete(task_id)
        print(f"Task {task.id} marked as complete: {task.content}")
    except KeyError:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)


def cmd_incomplete(store: TaskStore, args: list[str]) -> None:
    """Mark a task as incomplete.

    Usage: incomplete <task_id>
    """
    if not args:
        print("Error: Task ID required.", file=sys.stderr)
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Error: Invalid task ID. Must be a number.", file=sys.stderr)
        return

    try:
        task = store.mark_incomplete(task_id)
        print(f"Task {task.id} marked as incomplete: {task.content}")
    except KeyError:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)


def cmd_delete(store: TaskStore, args: list[str]) -> None:
    """Delete a task.

    Usage: delete <task_id>
    """
    if not args:
        print("Error: Task ID required.", file=sys.stderr)
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Error: Invalid task ID. Must be a number.", file=sys.stderr)
        return

    try:
        store.delete(task_id)
        print(f"Task {task_id} deleted.")
    except KeyError:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)


def cmd_update(store: TaskStore, args: list[str]) -> None:
    """Update a task's content.

    Usage: update <task_id> <new description>
    """
    if len(args) < 2:
        print("Error: Task ID and new description required.", file=sys.stderr)
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Error: Invalid task ID. Must be a number.", file=sys.stderr)
        return

    new_content = " ".join(args[1:])

    try:
        task = store.update(task_id, new_content)
        print(f"Task {task.id} updated: {task.content}")
    except KeyError:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)


def cmd_help() -> None:
    """Show help message.

    Usage: help
    """
    print("Todo CLI - Manage your tasks from the command line")
    print()
    print("Commands:")
    print("  add <description>       Add a new task")
    print("  list                    List all tasks")
    print("  complete <task_id>      Mark a task as complete")
    print("  incomplete <task_id>    Mark a task as incomplete")
    print("  delete <task_id>        Delete a task")
    print("  update <task_id> <desc> Update a task's description")
    print("  help                    Show this help message")
    print("  exit                    Exit the application")


def main() -> int:
    """Main entry point for the CLI application.

    Returns:
        Exit code (0 for success, non-zero for error).
    """
    store = TaskStore()

    print("Todo CLI - Type 'help' for available commands")
    print()

    while True:
        try:
            line = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting...")
            return 0

        if not line:
            continue

        parts = line.split()
        command = parts[0].lower()
        args = parts[1:]

        match command:
            case "add":
                cmd_add(store, args)
            case "list":
                cmd_list(store)
            case "complete":
                cmd_complete(store, args)
            case "incomplete":
                cmd_incomplete(store, args)
            case "delete":
                cmd_delete(store, args)
            case "update":
                cmd_update(store, args)
            case "help":
                cmd_help()
            case "exit" | "quit":
                print("Goodbye!")
                return 0
            case _:
                print(f"Unknown command: {command}. Type 'help' for available commands.", file=sys.stderr)
