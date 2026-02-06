# Implementation Plan: Advanced Todo Features

**Branch**: `004-advanced-todo-features` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-advanced-todo-features/spec.md`

## Summary

Transform Taskora from a basic CRUD todo application into an intelligent task management system with:
- **Intermediate Features**: Priorities, Tags, Search, Filter, Sort
- **Advanced Features**: Recurring Tasks, Due Dates, Reminders

Technical approach: Extend existing FastAPI + Next.js architecture with new database fields, models, API endpoints, and UI components while maintaining backward compatibility with existing task CRUD operations.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Next.js 16+, Tailwind CSS, Lucide React
**Storage**: PostgreSQL 15 (existing), Alembic migrations
**Testing**: Manual testing (production deployment on DOKS)
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <200ms for search/filter/sort, <2s page load with 100+ tasks
**Constraints**: Maintain backward compatibility, mobile responsive, graceful degradation
**Scale/Scope**: Single-user tasks, 1000+ tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status |
|------|-------------|--------|
| Feature Completeness | Each feature fully functional end-to-end | PASS - Plan covers backend → API → frontend → events |
| Progressive Enhancement | New features don't break existing | PASS - All existing fields preserved, new fields have defaults |
| Data Integrity | Priority, tags, due dates persist correctly | PASS - Database migrations with proper constraints |
| Performance First | Search/filter/sort <200ms | PASS - PostgreSQL indexes planned |
| Responsive UI | Mobile, tablet, desktop support | PASS - Tailwind responsive breakpoints |
| Event-Driven | Integrate with Dapr pub/sub | PASS - New event types defined |

**All gates PASS** - Proceeding with implementation.

## Project Structure

### Documentation (this feature)

```text
specs/004-advanced-todo-features/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md # REST API specifications
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py             # UPDATE: Add priority, due_date, recurrence fields
│   │   ├── tag.py              # NEW: Tag model
│   │   └── events.py           # UPDATE: Add new event types
│   ├── api/
│   │   ├── task_router.py      # UPDATE: Add filter, sort, search params
│   │   └── tag_router.py       # NEW: Tag CRUD endpoints
│   ├── services/
│   │   ├── task_service.py     # UPDATE: Add filter, sort, recurrence logic
│   │   ├── tag_service.py      # NEW: Tag operations
│   │   └── reminder_service.py # NEW: Reminder polling/scheduling
│   └── dapr/
│       └── task_events.py      # UPDATE: Add new event emitters
├── migrations/
│   └── versions/
│       └── 001_phase_vi_features.py  # NEW: Schema migration

frontend/
├── src/
│   ├── components/
│   │   ├── TaskList.tsx        # UPDATE: Add search, filter, sort UI
│   │   ├── TaskCard.tsx        # UPDATE: Add priority badge, tags, due date
│   │   ├── TaskForm.tsx        # UPDATE: Add all new fields
│   │   ├── PriorityBadge.tsx   # NEW: Priority indicator component
│   │   ├── TagInput.tsx        # NEW: Tag selection with autocomplete
│   │   ├── TagBadge.tsx        # NEW: Colored tag display
│   │   ├── FilterPanel.tsx     # NEW: Filter controls
│   │   ├── SortDropdown.tsx    # NEW: Sort selector
│   │   ├── DateTimePicker.tsx  # NEW: Due date/reminder picker
│   │   └── DueDateBadge.tsx    # NEW: Relative due date display
│   ├── hooks/
│   │   ├── useNotifications.ts # NEW: Browser notification hook
│   │   ├── useTaskFilters.ts   # NEW: Filter state management
│   │   └── useDebounce.ts      # NEW: Search debounce hook
│   ├── types/
│   │   └── task.ts             # UPDATE: Extended Task interface
│   └── lib/
│       └── api.ts              # UPDATE: Add new API methods
```

**Structure Decision**: Web application structure with separate backend and frontend directories matching existing codebase.

## Complexity Tracking

> No constitution violations - all features align with existing architecture.

| Decision | Rationale |
|----------|-----------|
| No separate reminder microservice | Use in-app polling for MVP; server push deferred to Phase VII |
| Tags as separate model | Many-to-many relationship required; cleaner than JSON array |
| Client-side filtering as fallback | Backend filtering primary; client-side for instant feedback |
