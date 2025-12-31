# Tasks: Phase I - Todo CLI Application

**Feature Branch**: `001-todo-cli`
**Input**: Design documents from `phase-1/specs/001-todo-cli/`
**Prerequisites**: spec.md (specification only, plan.md not available)

**Tests**: Not requested in spec - implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Python CLI application

- [x] T001 Create `phase-1/src/` directory structure for source code
- [x] T002 Create `phase-1/src/todo/` package directory with `__init__.py`
- [x] T003 [P] Create `phase-1/pyproject.toml` with Python 3.13+ requirement and argparse dependency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data structures and state management that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Task model dataclass in `phase-1/src/todo/models.py` with id, content, and is_complete fields
- [x] T005 [P] Create TaskStore class in `phase-1/src/todo/store.py` for in-memory state management with sequential ID generation

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manage Tasks Interactively (Priority: P1) MVP

**Goal**: Enable users to add, view, update, delete, and toggle task completion status

**Independent Test**: Run the application and verify all CRUD operations (Create, Read, Update, Delete) function correctly with appropriate feedback

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement add command in `phase-1/src/todo/cli.py` to create new tasks with content validation
- [x] T007 [P] [US1] Implement list command in `phase-1/src/todo/cli.py` to display all tasks with ID, content, and completion status
- [x] T008 [P] [US1] Implement complete command in `phase-1/src/todo/cli.py` to mark task as complete
- [x] T009 [P] [US1] Implement incomplete command in `phase-1/src/todo/cli.py` to mark task as incomplete
- [x] T010 [P] [US1] Implement delete command in `phase-1/src/todo/cli.py` to remove task by ID
- [x] T011 [US1] Implement update command in `phase-1/src/todo/cli.py` to modify task content (depends on T006)
- [x] T012 [US1] Implement CLI main loop in `phase-1/src/todo/cli.py` with command parsing and execution (depends on T006-T011)
- [x] T013 [US1] Create entry point in `phase-1/src/todo/__main__.py` to run CLI application

**Checkpoint**: At this point, all core CRUD operations work and the CLI is functional

---

## Phase 4: User Story 2 - Validate User Input (Priority: P2)

**Goal**: Provide clear feedback for invalid inputs including empty tasks, non-existent IDs, and malformed commands

**Independent Test**: Provide various invalid inputs and verify appropriate error messages

### Implementation for User Story 2

- [x] T014 [US2] Add empty/whitespace-only content validation in `phase-1/src/todo/cli.py` add command
- [x] T015 [US2] Add non-existent ID error handling in `phase-1/src/todo/cli.py` delete command
- [x] T016 [US2] Add non-existent ID error handling in `phase-1/src/todo/cli.py` update command
- [x] T017 [US2] Add non-existent ID error handling in `phase-1/src/todo/cli.py` complete command
- [x] T018 [US2] Add non-existent ID error handling in `phase-1/src/todo/cli.py` incomplete command
- [x] T019 [US2] Add unrecognized command handling in `phase-1/src/todo/cli.py` main loop

**Checkpoint**: User Story 2 complete - all validation scenarios handled with clear error messages

---

## Phase 5: User Story 3 - Session State Management (Priority: P3)

**Goal**: Ensure tasks persist within a session and state clears properly on restart

**Independent Test**: Perform multiple operations and verify state persists, then restart and verify empty state

### Implementation for User Story 3

- [x] T020 [US3] Verify TaskStore maintains state across operations in `phase-1/src/todo/store.py`
- [x] T021 [US3] Add empty list message in `phase-1/src/todo/cli.py` list command when no tasks exist
- [x] T022 [US3] Add exit command handling in `phase-1/src/todo/cli.py` main loop

**Checkpoint**: All user stories complete - application behaves correctly in all states

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that enhance usability across all features

- [x] T023 [P] Add help command in `phase-1/src/todo/cli.py` to display available commands
- [x] T024 [P] Improve output formatting in `phase-1/src/todo/cli.py` for list command (aligned columns, status indicators)
- [x] T025 [P] Add keyboard interrupt (Ctrl+C) handling in `phase-1/src/todo/cli.py` for graceful exit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories proceed sequentially (P1 → P2 → P3) due to natural dependency flow
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 command implementations
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 and US2 completion

### Within Each User Story

- Models (T004) before Services (T005)
- Services (T005) before CLI commands (T006-T011)
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T003) marked [P] can run in parallel
- All US1 CLI commands (T006-T011) marked [P] can run in parallel
- Polish tasks (T023-T025) marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all CLI command implementations together:
Task: "Implement add command in phase-1/src/todo/cli.py"
Task: "Implement list command in phase-1/src/todo/cli.py"
Task: "Implement complete command in phase-1/src/todo/cli.py"
Task: "Implement incomplete command in phase-1/src/todo/cli.py"
Task: "Implement delete command in phase-1/src/todo/cli.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test core CRUD operations work
5. Deploy/demo if MVP is sufficient

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Finalize

### Sequential Team Strategy

With single developer:
1. Complete Setup + Foundational together
2. Complete User Story 1 (core CRUD) → Validate
3. Complete User Story 2 (validation) → Validate
4. Complete User Story 3 (state management) → Validate
5. Complete Polish → Finalize

---

## Summary

- **Total Task Count**: 25 tasks
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 2 tasks
- **User Story 1 (P1 - MVP)**: 8 tasks
- **User Story 2 (P2)**: 6 tasks
- **User Story 3 (P3)**: 3 tasks
- **Polish Phase**: 3 tasks

**Parallel Opportunities**: 11 tasks marked [P] can be executed in parallel within their phases

**MVP Scope**: Complete Phases 1-3 → Core Todo CLI with add, list, complete, incomplete, delete, update commands

**Independent Test Criteria**:
- US1: All CRUD operations work with unique IDs and proper feedback
- US2: Invalid inputs rejected with clear error messages within 1 second
- US3: State persists across 100+ operations, clears on restart
