---
id: PHR-010
title: Phase 7 Sort Implementation
stage: green
date: 2026-01-30
surface: claude-code
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.implement phase 7
labels: [implementation, sort, US5, phase-7]
links:
  spec: specs/004-advanced-todo-features/spec.md
  ticket:
  adr:
  pr:
files:
  - backend/src/api/task_router.py
  - backend/src/services/task_service.py
  - frontend/src/components/SortDropdown.tsx
  - frontend/src/components/TaskList.tsx
  - specs/004-advanced-todo-features/tasks.md
tests:
  - manual: Sort tasks by date/priority/title/due date
---

## Prompt

/sp.implement phase 7

User requested completion of Phase 7 (US5: Sort Tasks) from the 004-advanced-todo-features task list.

## Response snapshot

Implemented Phase 7 (User Story 5 - Sort Tasks) with the following changes:

### Backend (T043-T044)
1. Added `sort_by` and `order` query parameters to `GET /api/tasks`:
   - `sort_by`: created_at, due_date, priority, title
   - `order`: asc or desc (default: desc)

2. Created `sort_tasks()` function in `task_service.py`:
   - Custom priority ordering: urgent(0) > high(1) > medium(2) > low(3)
   - Tasks without due_date sort to end when sorting by due_date
   - Case-insensitive title sorting

### Frontend (T045-T047)
1. Created `SortDropdown.tsx` component:
   - Dropdown with Date Created, Due Date, Priority, Title options
   - Shows current sort direction with arrow icons
   - Click to select, click again to toggle asc/desc
   - Clear sort option when active

2. Updated `TaskList.tsx`:
   - Added SortDropdown next to filter toggle button
   - Sort state persisted in URL (sort_by, order params)
   - API query includes sort parameters
   - Removed client-side sorting (now server-side)

## Outcome

- ✅ Impact: Users can sort tasks by various criteria with URL persistence
- 🧪 Tests: Manual testing via sort dropdown, verify task order changes
- 📁 Files: 3 files modified, 1 file created
- 🔁 Next prompts: /sp.implement phase 8 (Due Dates)
- 🧠 Reflection: Priority sorting uses custom order mapping for intuitive behavior

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - manual testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
