# Tasks: Interactive Colored Console UI

**Feature Branch**: `002-colored-interactive-ui`
**Input**: Design documents from `phase-1/specs/colored-interactive-ui/`
**Prerequisites**: spec.md (user stories), plan.md (tech stack), research.md, data-model.md, contracts/

**Tests**: Not requested in spec - implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Dependencies)

**Purpose**: Add Rich library dependency and prepare project structure

- [x] T001 Add Rich library to `phase-1/pyproject.toml` dependencies
- [x] T002 [P] Create `phase-1/src/todo/interactive.py` module with basic imports

---

## Phase 2: Foundational (Shared Components)

**Purpose**: Core display components and utilities used by all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create color detection utilities in `phase-1/src/todo/interactive.py` (FORCE_COLOR, tty detection)
- [x] T004 [P] Create icon provider in `phase-1/src/todo/interactive.py` (Unicode with ASCII fallback)
- [x] T005 [P] Create display constants (colors, styles) in `phase-1/src/todo/interactive.py`
- [x] T006 [P] Create MenuOption dataclass in `phase-1/src/todo/interactive.py`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Navigate Interactive Menu (Priority: P1) MVP

**Goal**: Display a menu-driven interface where users can navigate and select actions

**Independent Test**: Launch the application and verify the menu displays with all 8 options visible, input is accepted, and navigation works correctly

### Implementation for User Story 1

- [x] T007 [US1] Implement `display_banner()` function in `phase-1/src/todo/interactive.py`
- [x] T008 [US1] Implement `display_menu()` function in `phase-1/src/todo/interactive.py` with numbered options
- [x] T009 [US1] Create InteractiveMenu class in `phase-1/src/todo/interactive.py` with main loop
- [x] T010 [US1] Implement menu input validation in `phase-1/src/todo/interactive.py`
- [x] T011 [US1] Implement `get_user_input()` function in `phase-1/src/todo/interactive.py`
- [x] T012 [US1] Create `launch()` entry point function in `phase-1/src/todo/interactive.py`
- [x] T013 [US1] Update `phase-1/src/todo/__main__.py` to support interactive mode entry point

**Checkpoint**: At this point, the menu displays and navigates but has no task operations yet

---

## Phase 4: User Story 2 - View Tasks with Colored Display (Priority: P1)

**Goal**: Display tasks in a colored table with visual status indicators

**Independent Test**: Add tasks with different states and verify the colored table displays correctly with appropriate visual distinctions

### Implementation for User Story 2

- [x] T014 [US2] Implement `display_task_table()` function in `phase-1/src/todo/interactive.py` using Rich Table
- [x] T015 [US2] Add status icons (✓ for complete, ○ for incomplete) in `phase-1/src/todo/interactive.py`
- [x] T016 [US2] Apply color styling to table rows based on completion status in `phase-1/src/todo/interactive.py`
- [x] T017 [US2] Style column headers differently from data rows in `phase-1/src/todo/interactive.py`
- [x] T018 [US2] Implement `display_empty_state()` function in `phase-1/src/todo/interactive.py`
- [x] T019 [US2] Connect View Tasks menu option to task display in `phase-1/src/todo/interactive.py`

**Checkpoint**: User Story 2 complete - tasks display in colored table with icons

---

## Phase 5: User Story 3 - Receive Visual Feedback (Priority: P2)

**Goal**: Provide clear visual feedback for all user actions

**Independent Test**: Perform various operations and verify success and error messages are displayed appropriately

### Implementation for User Story 3

- [x] T020 [US3] Implement `display_success()` function in `phase-1/src/todo/interactive.py` with green styling
- [x] T021 [US3] Implement `display_error()` function in `phase-1/src/todo/interactive.py` with red styling
- [x] T022 [US3] Connect Add Task operation to success feedback in `phase-1/src/todo/interactive.py`
- [x] T023 [US3] Connect Update Task operation to success feedback in `phase-1/src/todo/interactive.py`
- [x] T024 [US3] Connect Delete Task operation to success feedback in `phase-1/src/todo/interactive.py`
- [x] T025 [US3] Connect Mark Complete/Incomplete operations to success feedback in `phase-1/src/todo/interactive.py`

**Checkpoint**: User Story 3 complete - all operations show visual feedback

---

## Phase 6: User Story 4 - Exit Gracefully (Priority: P3)

**Goal**: Handle exit from menu and Ctrl+C gracefully

**Independent Test**: Select exit option and verify the application closes cleanly with a goodbye message

### Implementation for User Story 4

- [x] T026 [US4] Implement Exit option handler in `phase-1/src/todo/interactive.py` with goodbye message
- [x] T027 [US4] Add Ctrl+C (KeyboardInterrupt) handling in `phase-1/src/todo/interactive.py` main loop

**Checkpoint**: User Story 4 complete - exit handling works gracefully

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that enhance usability across all features

- [x] T028 [P] Implement Help command display in `phase-1/src/todo/interactive.py`
- [x] T029 [P] Add delete confirmation prompt in `phase-1/src/todo/interactive.py`
- [x] T030 [P] Test monochrome fallback mode in `phase-1/src/todo/interactive.py`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories proceed sequentially (P1 → P2 → P3 → P4) due to natural dependency flow
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 menu display
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 input handling
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 main loop

### Within Each User Story

- Display utilities before menu integration
- Menu structure before task operations
- Success/error feedback after core operations
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks (T003-T006) marked [P] can run in parallel
- All US2 table tasks (T014-T019) marked [P] can run in parallel
- Polish tasks (T028-T030) marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all table display tasks together:
Task: "Implement display_task_table() function in phase-1/src/todo/interactive.py"
Task: "Add status icons in phase-1/src/todo/interactive.py"
Task: "Apply color styling to table rows in phase-1/src/todo/interactive.py"
Task: "Style column headers in phase-1/src/todo/interactive.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test menu navigation works
5. Deploy/demo if menu navigation is sufficient

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test menu navigation → Deploy/Demo
3. Add User Story 2 → Test colored task display → Deploy/Demo
4. Add User Story 3 → Test visual feedback → Deploy/Demo
5. Add User Story 4 → Test exit handling → Deploy/Demo
6. Add Polish → Finalize

### Sequential Team Strategy

With single developer:
1. Complete Setup + Foundational together
2. Complete User Story 1 (menu navigation) → Validate
3. Complete User Story 2 (colored display) → Validate
4. Complete User Story 3 (visual feedback) → Validate
5. Complete User Story 4 (exit handling) → Validate
6. Complete Polish → Finalize

---

## Summary

- **Total Task Count**: 30 tasks
- **Setup Phase**: 2 tasks
- **Foundational Phase**: 4 tasks
- **User Story 1 (P1 - MVP)**: 7 tasks
- **User Story 2 (P1)**: 6 tasks
- **User Story 3 (P2)**: 6 tasks
- **User Story 4 (P3)**: 2 tasks
- **Polish Phase**: 3 tasks

**Parallel Opportunities**: 14 tasks marked [P] can be executed in parallel within their phases

**MVP Scope**: Complete Phases 1-3 → Interactive menu with navigation

**Independent Test Criteria**:
- US1: Menu displays with all 8 options, accepts input, validates selection
- US2: Tasks shown in colored table with ✓ and ○ icons
- US3: Success (green) and error (red) messages displayed for operations
- US4: Exit option and Ctrl+C both terminate gracefully

---

## File Structure Summary

```
phase-1/src/todo/
├── __init__.py           # Package metadata
├── __main__.py           # Updated entry point
├── models.py             # Existing - Task model
├── store.py              # Existing - TaskStore
├── cli.py                # Existing - command-line interface
└── interactive.py        # NEW - colored menu-driven UI
    ├── display_banner()          # Title banner
    ├── display_menu()            # Menu options
    ├── display_task_table()      # Colored task list
    ├── display_success()         # Success messages
    ├── display_error()           # Error messages
    ├── display_empty_state()     # Empty list message
    ├── get_user_input()          # Input handling
    ├── should_use_colors()       # Color detection
    ├── get_status_icons()        # Icon provider
    ├── MenuOption dataclass      # Menu item definition
    ├── InteractiveMenu class     # Main menu handler
    └── launch()                  # Entry point
```
