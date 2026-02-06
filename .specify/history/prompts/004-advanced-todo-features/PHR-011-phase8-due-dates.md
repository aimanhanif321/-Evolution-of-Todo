---
id: PHR-011
title: Phase 8 Due Dates Implementation
stage: green
date: 2026-01-30
surface: claude-code
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.implement phase 8
labels: [implementation, due-dates, US6, phase-8]
links:
  spec: specs/004-advanced-todo-features/spec.md
  ticket:
  adr:
  pr:
files:
  - frontend/src/components/DateTimePicker.tsx
  - frontend/src/components/DueDateBadge.tsx
  - frontend/src/lib/utils.ts
  - frontend/src/components/TaskForm.tsx
  - frontend/src/components/TaskCard.tsx
  - specs/004-advanced-todo-features/tasks.md
tests:
  - manual: Set due dates on tasks, verify relative time display and overdue indicators
---

## Prompt

/sp.implement phase 8

User requested completion of Phase 8 (US6: Due Dates) from the 004-advanced-todo-features task list.

## Response snapshot

Implemented Phase 8 (User Story 6 - Due Dates) with the following changes:

### Backend (T048)
- Due date handling already exists in Task model and endpoints from Phase 2 setup
- No additional backend changes needed

### Frontend (T049-T054)
1. Created `DateTimePicker.tsx` component:
   - Native datetime-local input
   - Quick select buttons: Today, Tomorrow, In 3 days, In a week
   - Clear button to remove due date
   - Calendar icon for visual clarity

2. Created `DueDateBadge.tsx` component:
   - Color-coded badges based on status:
     - Red: Overdue tasks
     - Amber: Due soon (within 2 days)
     - Slate: Normal upcoming dates
     - Green: Completed tasks
   - Icons: AlertTriangle (overdue), Clock (soon), Calendar (normal)

3. Created `utils.ts` with helper functions:
   - `getRelativeDueDate()`: Returns human-readable text (e.g., "Due tomorrow", "Overdue by 2 days")
   - `isOverdue()`: Checks if date is past
   - `isDueSoon()`: Checks if within specified days
   - `formatDate()` and `formatDateTime()` utilities

4. Updated `TaskForm.tsx`:
   - Added due_date state
   - Integrated DateTimePicker component
   - Included due_date in payload

5. Updated `TaskCard.tsx`:
   - Displays DueDateBadge in footer
   - Red border and background tint for overdue tasks
   - Visual urgency indicators

## Outcome

- ✅ Impact: Users can set due dates with quick-select options and see visual urgency indicators
- 🧪 Tests: Manual testing via setting due dates, verify "Overdue", "Due tomorrow" displays
- 📁 Files: 3 files created, 2 files modified
- 🔁 Next prompts: /sp.implement phase 9 (Recurring Tasks)
- 🧠 Reflection: Relative time display provides better UX than absolute dates

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - manual testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
