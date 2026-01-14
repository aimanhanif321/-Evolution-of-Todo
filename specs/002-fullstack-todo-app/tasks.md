---
description: "Task list for Taskora full-stack todo web application"
---

# Tasks: Taskora Full-Stack Todo Web Application

**Input**: Design documents from `/specs/002-fullstack-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /sp.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan with backend/ and frontend/ directories
- [X] T002 Initialize backend with FastAPI and SQLModel dependencies in backend/requirements.txt
- [X] T003 [P] Initialize frontend with Next.js 16+, TypeScript, Tailwind CSS dependencies in frontend/package.json
- [X] T004 [P] Configure linting and formatting tools for both frontend and backend

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T005 Setup database schema and migrations framework using Alembic in backend/
- [X] T006 [P] Implement authentication/authorization framework with Better Auth and JWT in frontend/src/lib/auth.ts
- [X] T007 [P] Setup API routing and middleware structure in backend/src/main.py
- [X] T008 Create base models/entities that all stories depend on in backend/src/models/user.py and backend/src/models/task.py
- [X] T009 Configure error handling and logging infrastructure in backend/src/main.py
- [X] T010 Setup environment configuration management for both frontend and backend

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---
## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Enable new users to register with email and password, and authenticate to access their personal task list

**Independent Test**: Can be fully tested by registering a new user, logging in, and verifying access to the application dashboard. This delivers the core value of enabling personalized task management.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Contract test for authentication endpoints in backend/tests/contract/test_auth.py
- [ ] T012 [P] [US1] Integration test for user registration and login flow in backend/tests/integration/test_auth.py

### Implementation for User Story 1

- [X] T013 [P] [US1] Create User model in backend/src/models/user.py with email, name, created_at fields and proper validation
- [X] T014 [US1] Implement User service in backend/src/services/auth_service.py with registration, login, and password validation logic compatible with Better Auth JWT tokens
- [X] T015 [US1] Implement authentication endpoints in backend/src/api/auth_router.py for register, login, and logout
- [X] T016 [US1] Create login page component using auth-ui-login skill in frontend/src/app/auth/login/page.tsx
- [X] T017 [US1] Create register page component using auth-ui-register skill in frontend/src/app/auth/register/page.tsx
- [X] T018 [US1] Implement auth states management using auth-ui-states skill in frontend/src/components/auth-states/
- [X] T019 [US1] Implement auth flows using auth-ux-flows skill in frontend/src/components/auth/
- [X] T020 [US1] Add validation and error handling for auth forms in frontend/src/components/auth/
- [X] T021 [US1] Add centralized API client for auth requests in frontend/src/services/api.ts
- [X] T022 [US1] Add JWT token storage and retrieval in frontend/src/lib/auth.ts
- [X] T023 [US1] Add loading, empty, and error states for auth pages using auth-ui-states skill
- [X] T024 [US1] Add password validation with minimal requirements (min 6 chars) in frontend/src/components/auth/register-form/
- [X] T025 [US1] Implement refresh token logic with 30 min access tokens and 7 days refresh tokens in frontend/src/lib/auth.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---
## Phase 4: User Story 2 - Task Management (Create, Read, Update, Delete) (Priority: P2)

**Goal**: Allow authenticated users to create, view, update, and delete their personal tasks with titles and descriptions

**Independent Test**: Can be fully tested by logging in as a user, creating tasks, viewing them, updating them, marking them complete, and deleting them. This delivers the primary value of task organization and management.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T026 [P] [US2] Contract test for task endpoints in backend/tests/contract/test_tasks.py
- [ ] T027 [P] [US2] Integration test for task CRUD operations in backend/tests/integration/test_tasks.py

### Implementation for User Story 2

- [X] T028 [P] [US2] Create Task model in backend/src/models/task.py with proper validation and relationships to User
- [X] T029 [US2] Implement Task service in backend/src/services/task_service.py with CRUD operations and proper validation
- [X] T030 [US2] Implement task endpoints in backend/src/api/task_router.py for all CRUD operations (GET, POST, PUT, DELETE, PATCH)
- [X] T031 [US2] Create task list page component using todo-list-ui skill in frontend/src/app/tasks/page.tsx
- [X] T032 [US2] Create task action buttons using todo-action-button skill in frontend/src/components/ui/todo-action-button/
- [X] T033 [US2] Implement task form for creating/updating tasks with validation in frontend/src/components/ui/todo-action-button/
- [X] T034 [US2] Add loading, empty, and error states for task operations in frontend/src/components/ui/todo-list/
- [X] T035 [US2] Implement task filtering by completion status in frontend/src/components/ui/todo-list/
- [X] T036 [US2] Add advanced search with full-text search capability in frontend/src/components/ui/todo-list/
- [X] T037 [US2] Implement task creation API integration in frontend/src/services/api.ts
- [X] T038 [US2] Implement task update API integration in frontend/src/services/api.ts
- [X] T039 [US2] Implement task deletion API integration in frontend/src/services/api.ts
- [X] T040 [US2] Implement task completion toggle API integration in frontend/src/services/api.ts
- [X] T041 [US2] Add responsive design for task list using responsive-layout skill
- [X] T042 [US2] Add visual feedback for task operations (success, error) in frontend/src/components/ui/todo-list/

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---
## Phase 5: User Story 3 - Secure Multi-User Isolation (Priority: P3)

**Goal**: Ensure each user can only access and modify their own tasks, with proper authentication and authorization

**Independent Test**: Can be tested by logging in as different users and verifying that each user only sees their own tasks. This delivers the critical value of protecting user data privacy.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T043 [P] [US3] Contract test for user isolation endpoints in backend/tests/contract/test_isolation.py
- [ ] T044 [P] [US3] Integration test for multi-user access control in backend/tests/integration/test_isolation.py

### Implementation for User Story 3

- [X] T045 [P] [US3] Implement JWT validation middleware in backend/src/dependencies/auth_dependencies.py
- [X] T046 [US3] Add user_id validation in all task endpoints to enforce user isolation in backend/src/api/task_router.py
- [X] T047 [US3] Implement proper error responses (401, 403) for unauthorized access in backend/src/api/task_router.py
- [X] T048 [US3] Add user context extraction from JWT in backend/src/dependencies/auth_dependencies.py
- [X] T049 [US3] Implement account deletion functionality with confirmation in backend/src/api/auth_router.py
- [X] T050 [US3] Add email-based password reset functionality in backend/src/api/auth_router.py
- [X] T051 [US3] Add proper user_id extraction from JWT token in all authenticated endpoints
- [X] T052 [US3] Implement user isolation checks in all task service methods in backend/src/services/task_service.py
- [X] T053 [US3] Add token expiry handling in frontend/src/lib/auth.ts
- [X] T054 [US3] Add automatic token refresh functionality in frontend/src/lib/auth.ts
- [X] T055 [US3] Add proper error handling for unauthorized access in frontend/src/services/api.ts
- [X] T056 [US3] Add user-specific task filtering in frontend/src/components/ui/todo-list/

**Checkpoint**: All user stories should now be independently functional

---
[Add more user story phases as needed, following the same pattern]

---
## Phase 6: UI/UX Polish & Responsive Design

**Goal**: Implement modern SaaS-style UI with responsive design, loading states, and consistent styling

- [X] T057 [P] Create hero section component using hero-section skill in frontend/src/components/ui/hero-section/
- [X] T058 [P] Create navigation bar component using ui-navbar skill in frontend/src/components/ui/navbar/
- [X] T059 [P] Create sidebar component using app-sidebar skill in frontend/src/components/ui/sidebar/
- [X] T060 [P] Create card components using modern-card skill in frontend/src/components/ui/card/
- [X] T061 [P] Create button components using modern-button skill in frontend/src/components/ui/button/
- [X] T062 Implement responsive layout using responsive-layout skill across all pages
- [ ] T063 Add consistent spacing, colors, typography following Tailwind CSS guidelines
- [ ] T064 Add loading, empty, and error states for all UI components
- [ ] T065 Add hover/focus states for accessibility and interactivity
- [X] T066 Implement dashboard page using responsive-layout and modern-card skills in frontend/src/app/dashboard/page.tsx
- [X] T067 Add proper form validation with error display in all forms
- [X] T068 Add proper error boundaries and global error handling in frontend/src/app/error.tsx

---
## Phase 7: Edge Cases & Error Handling

**Goal**: Handle various edge cases and error conditions to ensure robust application behavior

- [X] T069 Implement token expiry handling during user session in frontend/src/lib/auth.ts
- [ ] T070 Add handling for multiple simultaneous login attempts with same credentials in backend/src/services/auth_service.py
- [ ] T071 Add proper error handling for malformed API requests in backend/src/main.py
- [ ] T072 Add database connectivity failure handling in backend/src/services/
- [ ] T073 Add proper error states for empty task lists in frontend/src/components/ui/todo-list/
- [ ] T074 Add error handling for invalid task fields in frontend/src/components/ui/todo-action-button/
- [ ] T075 Add offline mode handling in frontend/src/services/api.ts
- [ ] T076 Add proper timeout handling for API requests in frontend/src/services/api.ts

---
## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T077 [P] Documentation updates in docs/
- [ ] T078 Code cleanup and refactoring
- [ ] T079 Performance optimization across all stories
- [ ] T080 [P] Additional unit tests (if requested) in backend/tests/unit/ and frontend/tests/
- [ ] T081 Security hardening
- [ ] T082 Run quickstart.md validation

---
## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 authentication
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 authentication and US2 task functionality

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---
## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2 (depends on US1 auth)
   - Developer C: User Story 3 (depends on US1 auth and US2 tasks)
3. Stories complete and integrate independently

---
## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence