# Tasks: Advanced Todo Features

**Feature**: 004-advanced-todo-features
**Input**: Design documents from `/specs/004-advanced-todo-features/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-contracts.md ✓
**Date**: 2026-01-29

**Tests**: Tests are optional for this feature - manual testing via quickstart.md verification checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database migration, and shared type definitions

- [x] T001 Create Alembic migration for Phase VI schema in backend/alembic/versions/002_phase_vi_features.py
- [x] T002 [P] Add python-dateutil to backend/requirements.txt for recurrence calculations
- [x] T003 [P] Create Priority and RecurrenceRule enums in backend/src/models/task.py
- [x] T004 [P] Create TypeScript type definitions for new fields in frontend/src/types/task.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update Task model with new fields (priority, due_date, reminder_at, is_recurring, recurrence_rule, recurrence_interval, parent_task_id, reminder_sent) in backend/src/models/task.py
- [x] T006 [P] Create Tag model with id, name, color, user_id, created_at in backend/src/models/tag.py
- [x] T007 [P] Create TaskTag junction model in backend/src/models/tag.py
- [x] T008 Create TaskCreate, TaskRead, TaskUpdate Pydantic schemas with new fields in backend/src/models/task.py
- [x] T009 [P] Create TagCreate, TagRead, TagUpdate Pydantic schemas in backend/src/models/tag.py
- [x] T010 Register Tag and TaskTag models in backend/src/models/__init__.py
- [x] T011 Update task Dapr events with new fields (priority, due_date, tags) in backend/src/models/events.py
- [x] T012 [P] Create useDebounce hook for search in frontend/src/hooks/useDebounce.ts
- [x] T013 [P] Update frontend Task interface with all new fields in frontend/src/types/task.ts
- [x] T014 Add new API methods (search, filter, sort, tags CRUD) to frontend/src/lib/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Priority Management (Priority: P1) 🎯 MVP

**Goal**: Allow users to assign and display priority levels (Low/Medium/High/Urgent) on tasks

**Independent Test**: Create tasks with different priority levels, verify color-coded badges appear correctly

### Implementation for User Story 1

- [x] T015 [US1] Add priority field to task creation endpoint in backend/src/api/task_router.py
- [x] T016 [US1] Add priority field to task update endpoint in backend/src/api/task_router.py
- [x] T017 [P] [US1] Create PriorityBadge component with color mapping in frontend/src/components/PriorityBadge.tsx
- [x] T018 [US1] Add priority dropdown to TaskForm component in frontend/src/components/TaskForm.tsx
- [x] T019 [US1] Display PriorityBadge on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T020 [US1] Publish task.created and task.updated events with priority in backend/src/dapr/task_events.py

**Checkpoint**: User Story 1 complete - tasks display priority badges

---

## Phase 4: User Story 2 - Tag Organization (Priority: P2)

**Goal**: Allow users to create custom tags and assign multiple tags to tasks

**Independent Test**: Create tags, assign to tasks, verify colored tag badges display correctly

### Implementation for User Story 2

- [x] T021 [US2] Create tag_router.py with CRUD endpoints (GET/POST/PUT/DELETE /api/tags) in backend/src/api/tag_router.py
- [x] T022 [US2] Create tag_service.py with tag operations in backend/src/services/tag_service.py
- [x] T023 [US2] Register tag router in backend/src/main.py
- [x] T024 [US2] Handle tag_ids in task create/update to manage TaskTag relationships in backend/src/api/task_router.py
- [x] T025 [P] [US2] Create TagBadge component with custom colors in frontend/src/components/TagBadge.tsx
- [x] T026 [P] [US2] Create TagInput component with autocomplete in frontend/src/components/TagInput.tsx
- [x] T027 [US2] Add tag selection to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T028 [US2] Display TagBadge list on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T029 [US2] Add tag API methods (list, create, delete) to frontend/src/lib/api.ts

**Checkpoint**: User Story 2 complete - tasks can have multiple colored tags

---

## Phase 5: User Story 3 - Search Tasks (Priority: P3)

**Goal**: Enable keyword search across task titles and descriptions

**Independent Test**: Enter search terms, verify matching tasks appear with 300ms debounce

### Implementation for User Story 3

- [x] T030 [US3] Add search query parameter to GET /api/tasks with ILIKE filter in backend/src/api/task_router.py
- [x] T031 [US3] Implement case-insensitive search across title and description in backend/src/services/task_service.py
- [x] T032 [P] [US3] Create SearchInput component with debounced input in frontend/src/components/SearchInput.tsx
- [x] T033 [US3] Add SearchInput to TaskList header in frontend/src/components/TaskList.tsx
- [x] T034 [US3] Implement search state with useDebounce hook in frontend/src/components/TaskList.tsx
- [x] T035 [US3] Display "No tasks found" message when search returns empty in frontend/src/components/TaskList.tsx

**Checkpoint**: User Story 3 complete - users can search tasks by keyword

---

## Phase 6: User Story 4 - Filter Tasks (Priority: P4)

**Goal**: Filter tasks by status, priority, tags, and date range

**Independent Test**: Apply filter combinations, verify correct task subsets appear

### Implementation for User Story 4

- [x] T036 [US4] Add filter query parameters (status, priority, tags, due_before, due_after, overdue) to GET /api/tasks in backend/src/api/task_router.py
- [x] T037 [US4] Implement filter query building with SQLAlchemy in backend/src/services/task_service.py
- [x] T038 [P] [US4] Create FilterPanel component with status/priority/tag filters in frontend/src/components/FilterPanel.tsx
- [x] T039 [P] [US4] Create useTaskFilters hook for filter state in URL params in frontend/src/hooks/useTaskFilters.ts
- [x] T040 [US4] Add FilterPanel to TaskList in frontend/src/components/TaskList.tsx
- [x] T041 [US4] Implement "Clear all filters" functionality in frontend/src/components/FilterPanel.tsx
- [x] T042 [US4] Persist filter state in URL query parameters for sharing/bookmarking in frontend/src/components/TaskList.tsx

**Checkpoint**: User Story 4 complete - users can filter by multiple criteria

---

## Phase 7: User Story 5 - Sort Tasks (Priority: P5)

**Goal**: Sort tasks by due date, priority, title, or creation date

**Independent Test**: Select different sort options, verify task order changes correctly

### Implementation for User Story 5

- [x] T043 [US5] Add sort_by and order query parameters to GET /api/tasks in backend/src/api/task_router.py
- [x] T044 [US5] Implement priority sort with case expression for custom order in backend/src/services/task_service.py
- [x] T045 [P] [US5] Create SortDropdown component with sort options in frontend/src/components/SortDropdown.tsx
- [x] T046 [US5] Add SortDropdown to TaskList header in frontend/src/components/TaskList.tsx
- [x] T047 [US5] Persist sort state in URL query parameters in frontend/src/components/TaskList.tsx

**Checkpoint**: User Story 5 complete - users can sort tasks by various criteria

---

## Phase 8: User Story 6 - Due Dates (Priority: P6)

**Goal**: Set due dates on tasks with relative time display and overdue indicators

**Independent Test**: Set due dates on tasks, verify "Due tomorrow", "Overdue" indicators appear correctly

### Implementation for User Story 6

- [x] T048 [US6] Add due_date field handling in task create/update endpoints in backend/src/api/task_router.py
- [x] T049 [P] [US6] Create DateTimePicker component with native HTML inputs in frontend/src/components/DateTimePicker.tsx
- [x] T050 [P] [US6] Create DueDateBadge component with relative time display in frontend/src/components/DueDateBadge.tsx
- [x] T051 [US6] Add getRelativeDueDate utility function in frontend/src/lib/utils.ts
- [x] T052 [US6] Add DateTimePicker to TaskForm with quick-select buttons in frontend/src/components/TaskForm.tsx
- [x] T053 [US6] Display DueDateBadge on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T054 [US6] Add overdue visual indicator (red styling) to TaskCard in frontend/src/components/TaskCard.tsx

**Checkpoint**: User Story 6 complete - tasks show due dates with visual urgency indicators

---

## Phase 9: User Story 7 - Recurring Tasks (Priority: P7)

**Goal**: Create tasks that auto-regenerate on completion with Daily/Weekly/Monthly/Custom patterns

**Independent Test**: Create daily recurring task, complete it, verify new instance created with next due date

### Implementation for User Story 7

- [x] T055 [US7] Create calculate_next_due_date function with dateutil in backend/src/services/task_service.py
- [x] T056 [US7] Create PATCH /api/tasks/{id}/complete endpoint for recurring logic in backend/src/api/task_router.py
- [x] T057 [US7] Implement recurring task creation on completion (preserve properties, link parent_task_id) in backend/src/services/task_service.py
- [x] T058 [US7] Publish task.recurred Dapr event when new instance created in backend/src/dapr/task_events.py
- [x] T059 [P] [US7] Create RecurrenceSelector component in frontend/src/components/RecurrenceSelector.tsx
- [x] T060 [US7] Add recurrence options to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T061 [US7] Display recurring indicator icon on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T062 [US7] Update complete task API call to use new PATCH endpoint in frontend/src/lib/api.ts

**Checkpoint**: User Story 7 complete - recurring tasks auto-regenerate on completion

---

## Phase 10: User Story 8 - Reminders (Priority: P8)

**Goal**: Send browser notifications before task deadlines with configurable reminder times

**Independent Test**: Set reminder 1 minute before due, wait for notification to appear

### Implementation for User Story 8

- [x] T063 [US8] Add reminder_at field handling in task create/update endpoints in backend/src/api/task_router.py
- [x] T064 [US8] Create GET /api/tasks/reminders endpoint for polling due reminders in backend/src/api/task_router.py
- [x] T065 [US8] Create reminder_service.py with reminder query and mark-sent logic in backend/src/services/reminder_service.py
- [x] T066 [US8] Publish task.reminder Dapr event when reminder fires in backend/src/dapr/task_events.py
- [x] T067 [P] [US8] Create useNotifications hook with permission request and polling in frontend/src/hooks/useNotifications.ts
- [x] T068 [P] [US8] Create ReminderSelector component with time options in frontend/src/components/ReminderSelector.tsx
- [x] T069 [US8] Add ReminderSelector to TaskForm (visible when due_date is set) in frontend/src/components/TaskForm.tsx
- [x] T070 [US8] Implement 60-second reminder polling in main layout in frontend/src/app/layout.tsx
- [x] T071 [US8] Show browser notification with task title and due time in frontend/src/hooks/useNotifications.ts
- [x] T072 [US8] Create in-app notification fallback when browser notifications denied in frontend/src/components/NotificationBell.tsx

**Checkpoint**: User Story 8 complete - users receive reminders before deadlines

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T073 [P] Add responsive styling for mobile viewport in all new components
- [x] T074 [P] Run Ruff linting on all backend Python files
- [x] T075 [P] Run ESLint/Prettier on all frontend TypeScript files
- [x] T076 Verify all Dapr events publish correctly via docker-compose.dapr.yml
- [x] T077 Run quickstart.md verification checklist for all 8 user stories
- [x] T078 Performance test: Load 100+ tasks and verify <2s page load
- [x] T079 Update CLAUDE.md with Phase VI completion status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → ... → P8)
  - Some stories can run in parallel if staffed (US1-US3 are independent)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational) ─────┬───> US1 (Priority)
                            ├───> US2 (Tags)
                            ├───> US3 (Search)
                            ├───> US4 (Filter) ──> requires US1, US2 for full filter options
                            ├───> US5 (Sort) ───> most useful after US6
                            ├───> US6 (Due Dates)
                            ├───> US7 (Recurring) ─> requires US6 for due date calculation
                            └───> US8 (Reminders) ─> requires US6 for reminder scheduling
```

### Within Each User Story

- Backend before frontend
- API endpoints before UI components
- Core functionality before Dapr events
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (Setup phase)
- T006, T007, T009, T012, T013 can run in parallel (Foundational phase)
- T017, T025, T026, T032, T038, T039, T045, T049, T050, T059, T067, T068 are parallelizable within their phases
- US1, US2, US3 can run in parallel once foundational is complete

---

## Parallel Example: User Story 1

```bash
# After Phase 2 (Foundational) completes:

# Launch parallel backend + frontend work:
Task: "Create PriorityBadge component in frontend/src/components/PriorityBadge.tsx"
# While simultaneously:
Task: "Add priority field to task creation endpoint in backend/src/api/task_router.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T014) - CRITICAL
3. Complete Phase 3: User Story 1 (T015-T020)
4. **STOP and VALIDATE**: Test priority badges work correctly
5. Deploy/demo if ready - immediate value for users

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (Priority) → Test → Deploy (MVP!)
3. Add User Story 2 (Tags) → Test → Deploy
4. Add User Story 3 (Search) → Test → Deploy
5. Continue through User Stories 4-8
6. Each story adds value without breaking previous stories

### Suggested Story Groupings

**Group A (Organization)**: US1 + US2 + US3 (Priority, Tags, Search)
**Group B (Viewing)**: US4 + US5 (Filter, Sort)
**Group C (Time Management)**: US6 + US7 + US8 (Due Dates, Recurring, Reminders)

---

## Summary

| Phase | Description | Tasks | Parallel Tasks |
|-------|-------------|-------|----------------|
| 1 | Setup | 4 | 3 |
| 2 | Foundational | 10 | 5 |
| 3 | US1: Priority | 6 | 1 |
| 4 | US2: Tags | 9 | 2 |
| 5 | US3: Search | 6 | 1 |
| 6 | US4: Filter | 7 | 2 |
| 7 | US5: Sort | 5 | 1 |
| 8 | US6: Due Dates | 7 | 2 |
| 9 | US7: Recurring | 8 | 1 |
| 10 | US8: Reminders | 10 | 2 |
| 11 | Polish | 7 | 3 |
| **Total** | | **79** | **23** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run quickstart.md verification checklist after each story phase
