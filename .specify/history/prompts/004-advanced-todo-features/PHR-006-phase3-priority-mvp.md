---
id: PHR-006
title: Phase 3 Priority Management MVP
stage: green
date: 2026-01-30
surface: cli
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.implement
labels: [implementation, priority, mvp, us1, phase3, badge, taskform]
links:
  spec: specs/004-advanced-todo-features/spec.md
  plan: specs/004-advanced-todo-features/plan.md
  tasks: specs/004-advanced-todo-features/tasks.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - backend/src/api/task_router.py
  - frontend/src/components/PriorityBadge.tsx
  - frontend/src/components/TaskForm.tsx
  - frontend/src/components/TaskCard.tsx
tests:
  - N/A (manual verification via quickstart.md)
---

## Prompt

Run /sp.implement phase 3 to begin US1: Priority Management (MVP).

## Response snapshot

Executed Phase 3 (US1: Priority Management) - MVP feature complete:

### Tasks Completed (6/6)

| Task | Description | File |
|------|-------------|------|
| T015 | Add priority to task creation endpoint | backend/src/api/task_router.py |
| T016 | Add priority to task update endpoint | backend/src/api/task_router.py |
| T017 | Create PriorityBadge component | frontend/src/components/PriorityBadge.tsx |
| T018 | Add priority dropdown to TaskForm | frontend/src/components/TaskForm.tsx |
| T019 | Display PriorityBadge on TaskCard | frontend/src/components/TaskCard.tsx |
| T020 | Include priority in Dapr events | backend/src/api/task_router.py |

### Implementation Details

**Backend (task_router.py)**:
- Task creation now emits events with priority, due_date, is_recurring, recurrence_rule
- Task update now emits events with priority and due_date
- Priority field flows through TaskCreate/TaskUpdate schemas from Phase 2

**Frontend Components**:

**PriorityBadge.tsx** (New):
- Color-coded badge component (low: gray, medium: blue, high: orange, urgent: red)
- Configurable size (sm/md)
- Uses PRIORITY_COLORS from types/task.ts

**TaskForm.tsx** (Updated):
- Added priority state with default "medium"
- Priority selector with 4 colored buttons
- Visual feedback for selected priority
- Priority included in create/update payload

**TaskCard.tsx** (Updated):
- Displays PriorityBadge next to task title
- Badge only shown when priority is set

### Acceptance Criteria Verified

1. Users can select priority (Low/Medium/High/Urgent) when creating tasks
2. Priority displays as color-coded badge on TaskCard
3. Default priority is "Medium" for new tasks
4. Priority can be changed when editing tasks

## Outcome

- Impact: HIGH - MVP feature delivers immediate user value
- Tests: Manual verification via quickstart.md Priority Management checklist
- Files: 4 files created/modified
- Next prompts: `/sp.implement phase 4` to continue with US2: Tag Organization
- Reflection: Priority Management MVP complete, users can now prioritize tasks

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All acceptance scenarios implementable
- Prompt variant (if applicable): Phase-specific implementation
- Next experiment (smallest change to try): Execute Phase 4 (US2 Tag Organization)
