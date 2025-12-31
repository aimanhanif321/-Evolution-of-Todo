# Internal Contracts: Interactive Colored Console UI

## Overview

This is an internal CLI enhancement layer. There are no external API contracts. The UI layer calls existing core functions from the Phase 1 implementation.

## Internal API Contracts

### Entry Point Contract

```python
# phase-1/src/todo/interactive.py

def launch() -> int:
    """Launch interactive colored UI.

    Contract:
        - Reads no arguments
        - Returns exit code 0 on success, non-zero on error
        - Prints colored output to stdout
        - Reads user input from stdin
        - Handles Ctrl+C gracefully
        - Does not modify any persistent state
    """
```

### Core Integration Points

The UI layer integrates with existing core functions:

| Core Function | Source Module | Usage |
|---------------|---------------|-------|
| `store.add(content)` | `todo.store.TaskStore` | Add new task |
| `store.delete(task_id)` | `todo.store.TaskStore` | Delete task |
| `store.update(task_id, content)` | `todo.store.TaskStore` | Update task |
| `store.mark_complete(task_id)` | `todo.store.TaskStore` | Mark complete |
| `store.mark_incomplete(task_id)` | `todo.store.TaskStore` | Mark incomplete |
| `store.get_all()` | `todo.store.TaskStore` | List tasks |

### Display Contracts

```python
# phase-1/src/todo/interactive.py

def display_banner() -> None:
    """Display title banner.

    Contract:
        - Prints to stdout
        - Uses color styling
        - No user interaction
    """

def display_menu(options: list[MenuOption]) -> None:
    """Display menu options.

    Contract:
        - Prints to stdout
        - Each option shows number and label
        - No user interaction
    """

def display_tasks(tasks: list[Task]) -> None:
    """Display tasks in styled table.

    Contract:
        - Prints to stdout
        - Uses Rich Table or equivalent
        - Includes status icons and colors
        - Handles empty list gracefully
    """

def get_user_input(prompt: str) -> str:
    """Get user input from terminal.

    Contract:
        - Reads from stdin
        - Strips whitespace
        - Returns empty string on EOF/Interrupt
    """
```

---

## No External API Contracts

This enhancement has:
- No network requests
- No external service integrations
- No database connections
- No file I/O beyond standard Python execution
