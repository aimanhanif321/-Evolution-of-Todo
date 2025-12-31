# Quickstart: Interactive Colored Console UI

## Installation

```bash
pip install -e phase-1
```

## Running the Interactive UI

### Option 1: Direct Command

```bash
python -m todo.interactive
```

### Option 2: Via Entry Point (after pip install)

```bash
todo interactive
```

## User Journey

### 1. Launch Application

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║           TODO CLI - INTERACTIVE MODE                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

1. View Tasks
2. Add Task
3. Update Task
4. Delete Task
5. Mark Complete
6. Mark Incomplete
7. Help
8. Exit

> Enter your choice (1-8):
```

### 2. View Tasks (Empty State)

```
No tasks yet. Add one with option 2.
```

### 3. Add Task

```
> 2
Enter task description: Buy groceries
Task added: Buy groceries
```

### 4. View Tasks (With Tasks)

```
ID   Status    Description
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1    [✓]       Buy groceries
2    [○]       Write documentation
```

### 5. Mark Task Complete

```
> 5
Enter task ID to mark complete: 1
Task 1 marked as complete
```

### 6. Error Handling

```
> 9
Invalid choice. Please enter a number between 1 and 8.

> (empty input)
Please enter a value.

> abc
Invalid task ID. Please enter a number.
```

### 7. Exit

```
> 8
Goodbye!
```

## Environment Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `FORCE_COLOR` | Enable colors even in non-TTY | Any non-empty value |
| `TODO_NO_COLORS` | Disable all color output | Any non-empty value |

## Graceful Degradation

- If colors are unavailable, the UI displays in monochrome
- If Unicode is unavailable, ASCII icons are used: `[✓]` and `[ ]`
- The core functionality remains identical regardless of display mode
