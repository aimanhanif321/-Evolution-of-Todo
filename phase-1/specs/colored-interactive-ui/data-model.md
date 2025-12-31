# Data Model: Interactive Colored Console UI

## Overview

This enhancement layer adds display-oriented data structures for the interactive UI. The core Task model from `todo.models` remains unchanged.

## UI-Specific Entities

### MenuOption

Represents a selectable menu item in the interactive interface.

| Field | Type | Description |
|-------|------|-------------|
| id | int | Unique identifier (1-8) |
| label | str | Display text for the menu option |
| description | str | Help text shown for the option |
| handler | Callable | Function to execute when selected |

### TaskDisplay

Represents a task prepared for styled display output.

| Field | Type | Description |
|-------|------|-------------|
| id | int | Task identifier (from core model) |
| content | str | Task description (from core model) |
| status_icon | str | Icon string based on completion status |
| status_color | str | Color code for status indicator |
| row_style | str | Row styling (header vs data) |

### ColorScheme

Defines the color palette for the UI.

| Element | Color | Style |
|---------|-------|-------|
| Banner Title | magenta | bold |
| Menu Header | cyan | bold |
| Menu Option | white | normal |
| Menu Option Number | green | bold |
| Column Header | cyan | bold |
| Completed Task | green | normal |
| Incomplete Task | white | normal |
| Success Message | green | bold |
| Error Message | red | bold |
| Empty State | yellow | italic |

---

## Entity Relationships

```
InteractiveMenu
    └── contains -> MenuOption (8 items)
    └── uses -> TaskStore (existing)
    └── renders -> TaskDisplay (derived from Task)
```

---

## No Schema Migration Required

This enhancement:
- Does not modify the core Task model
- Does not add new data storage
- Does not change persistence behavior
