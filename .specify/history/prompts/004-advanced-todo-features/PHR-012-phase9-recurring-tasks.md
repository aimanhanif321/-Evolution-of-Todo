---
id: PHR-012
title: Phase 9 Recurring Tasks Implementation
stage: green
date: 2026-01-30
surface: claude-code
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.implement phase 9
labels: [implementation, recurring-tasks, US7, phase-9]
links:
  spec: specs/004-advanced-todo-features/spec.md
  ticket:
  adr:
  pr:
files:
  - backend/src/services/task_service.py
  - backend/src/api/task_router.py
  - backend/src/dapr/task_events.py
  - frontend/src/components/RecurrenceSelector.tsx
  - frontend/src/components/TaskForm.tsx
  - frontend/src/components/TaskCard.tsx
  - frontend/src/lib/api.ts
  - specs/004-advanced-todo-features/tasks.md
tests:
  - manual: Create recurring task, complete it, verify new instance with next due date
---

## Prompt

/sp.implement phase 9

User requested completion of Phase 9 (US7: Recurring Tasks) from the 004-advanced-todo-features task list.

## Response snapshot

Implemented Phase 9 (User Story 7 - Recurring Tasks) with the following changes:

### Backend (T055-T058)

1. **task_service.py** - Core recurring task logic:
   - `calculate_next_due_date()`: Uses dateutil for date calculations
     - Daily: +1 day
     - Weekly: +7 days
     - Monthly: +1 month (dateutil.relativedelta)
     - Custom: +N days (user-specified interval)
   - `create_recurring_instance()`: Creates new task when recurring task completed
     - Preserves title, description, priority, tags
     - Sets parent_task_id for lineage tracking
     - Clears completion and reminder status
   - `complete_task_with_recurrence()`: Returns tuple (completed_task, new_task | None)

2. **task_router.py** - PATCH /api/tasks/{id}/complete endpoint:
   - Calls `complete_task_with_recurrence()` for recurring logic
   - Returns `{ completed_task, next_task }` when recurring task creates new instance
   - Emits task.completed and task.recurred Dapr events

3. **task_events.py** - Added `emit_task_recurred()`:
   - Publishes event with original_task_id, new_task_id, next_due_date
   - Links completed task to new recurring instance

### Frontend (T059-T062)

1. **RecurrenceSelector.tsx** - New component:
   - Toggle switch to enable/disable recurring
   - Rule selection: Daily, Weekly, Monthly, Custom
   - Custom interval input (1-365 days)
   - Helper text explaining recurrence pattern

2. **TaskForm.tsx** - Updated:
   - Added isRecurring, recurrenceRule, recurrenceInterval state
   - Integrated RecurrenceSelector after DateTimePicker
   - Includes recurrence fields in create/update payload

3. **TaskCard.tsx** - Updated:
   - Added Repeat icon import
   - Shows recurring badge with rule label (e.g., "daily", "weekly")
   - Tooltip shows recurrence pattern

4. **api.ts** - Already implemented:
   - `completeTask()` method handles `RecurringTaskCompleteResponse` type
   - Returns union type `Task | RecurringTaskCompleteResponse`

## Outcome

- ✅ Impact: Recurring tasks auto-regenerate with next due date when completed
- 🧪 Tests: Manual testing via creating recurring task, completing, verify new instance
- 📁 Files: 1 created, 5 modified
- 🔁 Next prompts: /sp.implement phase 10 (Reminders)
- 🧠 Reflection: Using dateutil.relativedelta handles month-end edge cases correctly

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - manual testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
