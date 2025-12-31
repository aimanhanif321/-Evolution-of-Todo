"""Interactive colored console UI for the Todo CLI application."""

import os
import sys
from dataclasses import dataclass
from typing import Protocol

# Configure encoding for Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from rich import print as rich_print
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from todo.models import Task
from todo.store import TaskStore


# =============================================================================
# Color Detection Utilities
# =============================================================================

def should_use_colors() -> bool:
    """Detect if terminal supports colors.

    Returns:
        True if colors should be used, False otherwise.
    """
    # Explicit override
    if os.environ.get("FORCE_COLOR") is not None:
        return True

    if os.environ.get("TODO_NO_COLORS") is not None:
        return False

    # No colors if not a TTY
    if not sys.stdout.isatty():
        return False

    # Disable for known non-color terminals
    term = os.environ.get("TERM", "")
    if term in ("dumb", ""):
        return False

    return True


def should_use_unicode() -> bool:
    """Detect if terminal supports Unicode characters.

    Returns:
        True if Unicode should be used, False for ASCII fallback.
    """
    # Check for FORCE_COLOR override
    if os.environ.get("FORCE_COLOR") is not None:
        return True

    # Check environment
    encoding = sys.stdout.encoding or ""
    if "utf" not in encoding.lower():
        return False

    # Check for ASCII-only environment
    if os.environ.get("LC_ALL", "").lower() == "c":
        return False

    return sys.stdout.isatty()


# =============================================================================
# Icon Provider
# =============================================================================

def get_status_icons() -> tuple[str, str]:
    """Get status icons based on terminal capability.

    Returns:
        Tuple of (complete_icon, incomplete_icon).
    """
    if should_use_unicode():
        return "✓", "○"
    return "[✓]", "[ ]"


# =============================================================================
# Display Constants
# =============================================================================

# Colors (using Rich color names)
COLOR_BANNER = "magenta"
COLOR_MENU_HEADER = "cyan"
COLOR_MENU_OPTION = "white"
COLOR_MENU_NUMBER = "green"
COLOR_COLUMN_HEADER = "cyan"
COLOR_COMPLETE = "green"
COLOR_INCOMPLETE = "white"
COLOR_SUCCESS = "green"
COLOR_ERROR = "red"
COLOR_EMPTY = "yellow"

# Styles
STYLE_BANNER = "bold"
STYLE_HEADER = "bold"
STYLE_SUCCESS = "bold"
STYLE_ERROR = "bold"
STYLE_EMPTY = "italic"


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class MenuOption:
    """Represents a selectable menu item.

    Attributes:
        id: Unique identifier (1-8).
        label: Display text for the menu option.
        description: Help text shown for the option.
    """

    id: int
    label: str
    description: str


# =============================================================================
# Menu Definition
# =============================================================================

MENU_OPTIONS = [
    MenuOption(1, "View Tasks", "See all your tasks"),
    MenuOption(2, "Add Task", "Create a new task"),
    MenuOption(3, "Update Task", "Edit an existing task"),
    MenuOption(4, "Delete Task", "Remove a task"),
    MenuOption(5, "Mark Complete", "Mark a task as done"),
    MenuOption(6, "Mark Incomplete", "Mark a task as not done"),
    MenuOption(7, "Help", "Show this menu"),
    MenuOption(8, "Exit", "Close the application"),
]


# =============================================================================
# Display Functions
# =============================================================================

def display_banner() -> None:
    """Display the application title banner with styling."""
    title = Text("TODO CLI - INTERACTIVE MODE", justify="center", style=COLOR_BANNER)
    panel = Panel(title, style=f"{COLOR_BANNER} on black")
    rich_print(panel)
    rich_print()


def display_menu() -> None:
    """Display the main menu with colored options."""
    rich_print(f"[{COLOR_MENU_HEADER}]{'─' * 50}[/]")
    rich_print(f"[{COLOR_MENU_HEADER} bold]MAIN MENU[/]")
    rich_print(f"[{COLOR_MENU_HEADER}]{'─' * 50}[/]")
    rich_print()

    for option in MENU_OPTIONS:
        rich_print(
            f"[{COLOR_MENU_NUMBER}]{option.id}.[/] "
            f"[{COLOR_MENU_OPTION}]{option.label:<15}[/]  "
            f"[dim]{option.description}[/]"
        )

    rich_print()
    rich_print(f"[dim]Enter a number (1-8) and press Enter[/]")


def display_task_table(tasks: list[Task]) -> None:
    """Display tasks in a styled table with icons and colors.

    Args:
        tasks: List of Task objects to display.
    """
    complete_icon, incomplete_icon = get_status_icons()

    table = Table(show_header=True, header_style=f"bold {COLOR_COLUMN_HEADER}")

    table.add_column("ID", width=4, style=COLOR_MENU_NUMBER)
    table.add_column("Status", width=10, style=COLOR_MENU_HEADER)
    table.add_column("Description", justify="left")

    for task in tasks:
        status_icon = complete_icon if task.is_complete else incomplete_icon
        status_color = COLOR_COMPLETE if task.is_complete else COLOR_INCOMPLETE
        status_text = Text(status_icon, style=status_color)
        content = Text(task.content, style=status_color)

        row_style = status_color
        table.add_row(
            str(task.id),
            status_text,
            content,
            style=row_style,
        )

    rich_print(table)


def display_empty_state() -> None:
    """Display message when no tasks exist."""
    rich_print(f"[{COLOR_EMPTY}]{'─' * 50}[/]")
    rich_print(f"[{COLOR_EMPTY} italic]No tasks yet.[/]")
    rich_print(f"[{COLOR_EMPTY} italic]Add one with option 2.[/]")
    rich_print(f"[{COLOR_EMPTY}]{'─' * 50}[/]")


def display_success(message: str) -> None:
    """Display a success message with styling.

    Args:
        message: The success message to display.
    """
    rich_print(f"[{COLOR_SUCCESS}]{STYLE_SUCCESS}✓ {message}[/]")


def display_error(message: str) -> None:
    """Display an error message with styling.

    Args:
        message: The error message to display.
    """
    rich_print(f"[{COLOR_ERROR}]{STYLE_ERROR}✗ {message}[/]")


def display_help() -> None:
    """Display help information."""
    display_banner()
    rich_print()
    rich_print(f"[{COLOR_MENU_HEADER} bold]HOW TO USE[/]")
    rich_print()
    rich_print("This interactive menu lets you manage your tasks without typing commands.")
    rich_print()
    rich_print(f"[{COLOR_MENU_NUMBER}]1.[/] View Tasks   - See all your tasks in a colored table")
    rich_print(f"[{COLOR_MENU_NUMBER}]2.[/] Add Task     - Create a new task")
    rich_print(f"[{COLOR_MENU_NUMBER}]3.[/] Update Task  - Edit an existing task")
    rich_print(f"[{COLOR_MENU_NUMBER}]4.[/] Delete Task  - Remove a task")
    rich_print(f"[{COLOR_MENU_NUMBER}]5.[/] Mark Complete - Mark a task as done")
    rich_print(f"[{COLOR_MENU_NUMBER}]6.[/] Mark Incomplete - Mark a task as not done")
    rich_print(f"[{COLOR_MENU_NUMBER}]7.[/] Help         - Show this help message")
    rich_print(f"[{COLOR_MENU_NUMBER}]8.[/] Exit         - Close the application")
    rich_print()
    rich_print("Tips:")
    rich_print("  - Type a number and press Enter to select an option")
    rich_print("  - Press Ctrl+C at any time to exit")
    rich_print("  - Your tasks are saved for this session only")


# =============================================================================
# Input Handling
# =============================================================================

def get_user_input(prompt: str) -> str:
    """Get user input from terminal.

    Args:
        prompt: The prompt to display.

    Returns:
        The user's input, stripped of whitespace. Empty string if EOF/Interrupt.
    """
    try:
        return input(prompt).strip()
    except (EOFError, KeyboardInterrupt):
        return ""


def get_menu_selection() -> str:
    """Get and validate menu selection from user.

    Returns:
        Valid selection string, or empty string if invalid/cancelled.
    """
    selection = get_user_input("> Enter your choice (1-8): ")

    if not selection:
        return ""

    if selection.isdigit() and 1 <= int(selection) <= 8:
        return selection

    display_error("Invalid choice. Please enter a number between 1 and 8.")
    return ""


def get_task_id() -> int | None:
    """Get and validate a task ID from user.

    Returns:
        Task ID as integer, or None if invalid/cancelled.
    """
    task_id_str = get_user_input("Enter task ID: ")

    if not task_id_str:
        return None

    if not task_id_str.isdigit():
        display_error("Invalid task ID. Please enter a number.")
        return None

    return int(task_id_str)


def get_task_content() -> str | None:
    """Get task content from user.

    Returns:
        Task content string, or None if empty/cancelled.
    """
    content = get_user_input("Enter task description: ")

    if not content:
        display_error("Task content cannot be empty.")
        return None

    return content


def confirm_delete() -> bool:
    """Get delete confirmation from user.

    Returns:
        True if confirmed, False otherwise.
    """
    confirm = get_user_input("Delete this task? (y/n): ").lower()
    return confirm == "y"


# =============================================================================
# Interactive Menu
# =============================================================================

class InteractiveMenu:
    """Interactive menu-driven interface for the Todo CLI."""

    def __init__(self, store: TaskStore) -> None:
        """Initialize menu with task store.

        Args:
            store: TaskStore instance for task operations.
        """
        self.store = store

    def run(self) -> None:
        """Run the main menu loop until exit."""
        while True:
            display_banner()
            display_menu()
            rich_print()

            selection = get_menu_selection()
            if not selection:
                continue

            if not self.handle_selection(selection):
                break

    def handle_selection(self, selection: str) -> bool:
        """Handle user menu selection.

        Args:
            selection: User's menu choice.

        Returns:
            True to continue, False to exit.
        """
        choice = int(selection)

        match choice:
            case 1:
                self.do_view_tasks()
            case 2:
                self.do_add_task()
            case 3:
                self.do_update_task()
            case 4:
                self.do_delete_task()
            case 5:
                self.do_mark_complete()
            case 6:
                self.do_mark_incomplete()
            case 7:
                display_help()
            case 8:
                self.do_exit()
                return False

        rich_print()
        rich_print("[dim]Press Enter to continue...[/]")
        get_user_input("")
        return True

    def do_view_tasks(self) -> None:
        """Display all tasks."""
        tasks = self.store.get_all()

        if not tasks:
            display_empty_state()
            return

        display_task_table(tasks)

    def do_add_task(self) -> None:
        """Add a new task."""
        content = get_task_content()
        if content is None:
            return

        try:
            task = self.store.add(content)
            display_success(f"Task {task.id} added: {task.content}")
        except ValueError as e:
            display_error(str(e))

    def do_update_task(self) -> None:
        """Update an existing task."""
        task_id = get_task_id()
        if task_id is None:
            return

        task = self.store.get(task_id)
        if task is None:
            display_error(f"Task {task_id} not found.")
            return

        rich_print(f"Current: {task.content}")
        new_content = get_user_input("Enter new description (or press Enter to keep): ")

        if not new_content:
            display_error("No changes made.")
            return

        try:
            updated = self.store.update(task_id, new_content)
            display_success(f"Task {updated.id} updated: {updated.content}")
        except ValueError as e:
            display_error(str(e))

    def do_delete_task(self) -> None:
        """Delete a task."""
        task_id = get_task_id()
        if task_id is None:
            return

        task = self.store.get(task_id)
        if task is None:
            display_error(f"Task {task_id} not found.")
            return

        rich_print(f"Task: {task.content}")

        if not confirm_delete():
            display_error("Delete cancelled.")
            return

        try:
            self.store.delete(task_id)
            display_success(f"Task {task_id} deleted.")
        except KeyError:
            display_error(f"Task {task_id} not found.")

    def do_mark_complete(self) -> None:
        """Mark a task as complete."""
        task_id = get_task_id()
        if task_id is None:
            return

        try:
            task = self.store.mark_complete(task_id)
            display_success(f"Task {task.id} marked as complete: {task.content}")
        except KeyError:
            display_error(f"Task {task_id} not found.")

    def do_mark_incomplete(self) -> None:
        """Mark a task as incomplete."""
        task_id = get_task_id()
        if task_id is None:
            return

        try:
            task = self.store.mark_incomplete(task_id)
            display_success(f"Task {task.id} marked as incomplete: {task.content}")
        except KeyError:
            display_error(f"Task {task_id} not found.")

    def do_exit(self) -> None:
        """Exit the application."""
        rich_print()
        display_success("Goodbye!")
        rich_print()


# =============================================================================
# Entry Point
# =============================================================================

def launch() -> int:
    """Launch the interactive colored UI.

    Returns:
        Exit code (0 for success, non-zero for error).
    """
    try:
        menu = InteractiveMenu(TaskStore())
        menu.run()
        return 0
    except KeyboardInterrupt:
        rich_print()
        display_success("Goodbye!")
        return 0
    except Exception as e:
        display_error(f"An error occurred: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(launch())
