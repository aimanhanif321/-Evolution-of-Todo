---
id: "001-taskora-tasks-generation"
stage: tasks
feature: "Taskora"
date: "2026-01-11"
title: "Taskora Tasks Generation"
---

# Taskora Tasks Generation

## PROMPT_TEXT

@specs/overview.md
@specs/features/*.md
@specs/api/*.md
@specs/database/schema.md
@CLAUDE.md

INSTRUCTIONS FOR CLAUDE CODE:

1. READ AND FOLLOW STRICTLY:
   - Taskora Phase II Constitution and all specs
   - Monorepo structure and CLAUDE.md guidance
   - Agents (.claude/agents) and Skills (.claude/skills)
   - No assumptions outside Constitution and specs

2. OBJECTIVE:
   - Generate a **comprehensive task list** for Phase II
   - Include **frontend, backend, DB, auth, UI/UX**, edge cases, and API
   - Each task should be granular, professional, ready-to-implement
   - No task should be vague; include all **details down to component props, API parameters, folder paths, imports, responsive behavior, and error handling**

3. TASK CATEGORIES:

A. Frontend Tasks:
   - Map all UI components to their corresponding skills
   - Include modern UI elements (cards, buttons, layout, task list)
   - Include responsive design for mobile/tablet/desktop
   - Include loading, empty, error, success states
   - Include form validation for login/signup/task inputs
   - Specify Tailwind CSS classes, spacing, typography, colors
   - Specify pages (/app/dashboard, /app/login, /app/register)
   - Include API integration tasks with centralized api client (/lib/api.ts)
   - Include accessibility and interactivity (hover/focus states)

B. Backend Tasks:
   - Implement all CRUD endpoints for tasks
   - Validate JWT token and enforce user isolation
   - Handle errors (401, 403, 404, 500)
   - Map endpoints to frontend tasks
   - Ensure proper Pydantic models and SQLModel ORM usage
   - Include environment variable configuration for DATABASE_URL and JWT secret
   - Include unit test tasks for each endpoint

C. Database Tasks:
   - Create tables: users, tasks
   - Define all columns, types, defaults, and constraints
   - Define indexes for filtering and performance
   - Include migration and seed data tasks
   - Include DB connectivity check tasks

D. Authentication Tasks:
   - Setup Better Auth plugin on frontend
   - Implement JWT token generation on login/signup
   - Include token attach to all API requests
   - Backend JWT validation middleware tasks
   - Password validation per selected rules
   - Expired/invalid token handling

E. Edge Cases:
   - Token expiry mid-session
   - Invalid API requests
   - Multiple simultaneous logins
   - Database connectivity failure
   - Empty or malformed task fields
   - Frontend error & empty states

4. TASK FORMAT:
   - Task title
   - Layer (frontend/backend/db/auth/ui)
   - Description
   - Input/Output
   - Mapping to spec files and CLAUDE.md
   - Mapping to agent(s) and skill(s)
   - Dependencies (if any)
   - Acceptance criteria

5. OUTPUT:
   - Generate **one detailed task list** covering **every single feature** of Taskora Phase II
   - Each task must be granular enough to **implement without asking for more info**
   - T

## RESPONSE_TEXT

Successfully generated a comprehensive task list for the Taskora Full-Stack Todo Web Application in specs/002-fullstack-todo-app/tasks.md.

The task list includes:

1. Phase 1: Setup tasks for project initialization
2. Phase 2: Foundational tasks for blocking prerequisites (authentication framework, database setup, API routing)
3. Phase 3: User Story 1 tasks for user registration and login (P1 priority)
4. Phase 4: User Story 2 tasks for task management CRUD operations (P2 priority)
5. Phase 5: User Story 3 tasks for secure multi-user isolation (P3 priority)
6. Phase 6: UI/UX polish and responsive design tasks
7. Phase 7: Edge cases and error handling tasks
8. Phase N: Cross-cutting concerns and polish tasks

Each task follows the required format with:
- Sequential task IDs (T001, T002, etc.)
- Parallelization markers [P] where applicable
- User story labels [US1], [US2], [US3] for story-specific tasks
- Specific file paths and implementation details
- Dependencies clearly noted

The task list is organized to enable independent implementation and testing of each user story, with proper phase dependencies and parallel execution opportunities identified.