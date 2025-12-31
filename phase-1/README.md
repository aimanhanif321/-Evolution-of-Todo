# Todo CLI - Phase 1

A command-line interface for managing tasks with in-memory storage. This is Phase 1 of the Evolution of Todos project.

## Features

- **Add Tasks**: Create new tasks with unique IDs
- **List Tasks**: View all tasks with their status
- **Update Tasks**: Modify task content
- **Delete Tasks**: Remove tasks by ID
- **Mark Complete/Incomplete**: Toggle task status
- **Interactive Mode**: Menu-driven interface with colored output (optional)

## Quick Start

### Prerequisites

- Python 3.13 or higher
- pip (usually comes with Python)

### Installation

1. Navigate to the phase-1 directory:

```bash
cd phase-1
```

2. Install the package in development mode:

```bash
pip install -e .
```

### Running the Application

#### Standard CLI Mode

```bash
todo
```

#### Interactive Colored Mode

```bash
todo-interactive
```

## Usage

### Standard CLI Commands

Once the application is running, use these commands:

| Command | Description | Example |
|---------|-------------|---------|
| `add <description>` | Add a new task | `add Buy groceries` |
| `list` | Show all tasks | `list` |
| `complete <task_id>` | Mark task as complete | `complete 1` |
| `incomplete <task_id>` | Mark task as incomplete | `incomplete 1` |
| `delete <task_id>` | Delete a task | `delete 1` |
| `update <task_id> <description>` | Update task content | `update 1 Buy milk` |
| `help` | Show help message | `help` |
| `exit` | Close the application | `exit` |

### Interactive Menu

Run `todo-interactive` to use the menu-driven interface:

1. View Tasks - See all tasks in a colored table
2. Add Task - Create a new task
3. Update Task - Edit an existing task
4. Delete Task - Remove a task
5. Mark Complete - Mark a task as done
6. Mark Incomplete - Mark a task as not done
7. Help - Show help message
8. Exit - Close the application

## Project Structure

```
phase-1/
├── src/todo/
│   ├── __init__.py        # Package initialization
│   ├── __main__.py        # Entry point
│   ├── cli.py             # Standard CLI implementation
│   ├── interactive.py     # Interactive colored UI
│   ├── models.py          # Task data model
│   └── store.py           # In-memory task storage
├── specs/
│   └── 001-todo-cli/
│       └── spec.md        # Feature specification
├── pyproject.toml         # Project configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Dependencies

- **rich>=13.0.0** - For colored terminal output in interactive mode

## Development

### Running from Source

You can also run directly without installation:

```bash
# Standard CLI
python -m todo

# Interactive mode
python -m todo.interactive
```

### Code Quality

This project uses:
- **pyright** for type checking (configured in `pyproject.toml`)
- **Python 3.13+** for type safety with required syntax

## Configuration

### Environment Variables

For the interactive colored UI:

| Variable | Description |
|----------|-------------|
| `FORCE_COLOR` | Set to any value to force color output |
| `TODO_NO_COLORS` | Set to any value to disable colors |

### Windows Encoding

The interactive mode automatically configures UTF-8 encoding for Windows terminals.

## Limitations (Phase 1)

- Tasks are stored in-memory only and will be lost when the application closes
- No persistent storage or data backup
- Single-user only
- No task categories, tags, or priorities
- No due dates or deadlines
- No search or filter capabilities

## Future Phases

Phase 2 and beyond will add:
- Persistent storage (JSON file)
- Task categories and tags
- Priority levels
- Due dates
- Search and filtering
- Export/import functionality
- And more...

## License

MIT
