---
id: PHR-002
title: Advanced Todo Features Implementation Plan
stage: plan
date: 2026-01-29
surface: cli
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.plan
labels: [plan, implementation, priorities, tags, search, filter, sort, recurring, due-dates, reminders]
links:
  spec: specs/004-advanced-todo-features/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/004-advanced-todo-features/plan.md
  - specs/004-advanced-todo-features/research.md
  - specs/004-advanced-todo-features/data-model.md
  - specs/004-advanced-todo-features/quickstart.md
  - specs/004-advanced-todo-features/contracts/api-contracts.md
  - CLAUDE.md
tests:
  - N/A (planning document)
---

## Prompt

Run /sp.plan to create the implementation plan based on the Advanced Todo Features specification (004-advanced-todo-features).

## Response snapshot

Created comprehensive implementation plan with all Phase 0 and Phase 1 artifacts:

**Plan File**: `specs/004-advanced-todo-features/plan.md`
- Technical context: Python 3.11+, TypeScript, FastAPI, Next.js, PostgreSQL
- Constitution check: All 6 gates PASSED
- Project structure: Web application (backend + frontend)
- File change list: 15+ files to create/update

**Research File**: `specs/004-advanced-todo-features/research.md`
- 12 technical decisions documented
- Priority enum implementation
- Many-to-many tag relationship
- Search with PostgreSQL ILIKE
- Filter query building pattern
- Sort implementation with priority mapping
- Recurring task logic with dateutil
- Due date display calculations
- Browser notifications API
- Reminder polling strategy (60s interval)
- Database indexes for performance
- Date picker: native HTML inputs
- Filter state in URL query params

**Data Model**: `specs/004-advanced-todo-features/data-model.md`
- Task model with 8 new fields
- Tag model (new)
- TaskTag junction table (new)
- Priority and RecurrenceRule enums
- SQLModel definitions
- Alembic migration script

**API Contracts**: `specs/004-advanced-todo-features/contracts/api-contracts.md`
- GET /api/tasks with filter/sort/search params
- POST/PUT/DELETE /api/tasks endpoints
- PATCH /api/tasks/{id}/complete (handles recurrence)
- PATCH /api/tasks/{id}/reminder
- GET /api/tasks/reminders (for polling)
- Full Tag CRUD endpoints
- Request/Response TypeScript interfaces
- 6 Dapr event schemas

**Quickstart**: `specs/004-advanced-todo-features/quickstart.md`
- Local development setup
- Feature verification checklist
- API testing examples
- Troubleshooting guide
- Production deployment steps

**Agent Context**: Updated CLAUDE.md with new technologies

## Outcome

- Impact: HIGH - Complete implementation blueprint for 8 user stories
- Tests: N/A (planning document)
- Files: 5 planning artifacts created, CLAUDE.md updated
- Next prompts: `/sp.tasks` to generate implementation task list
- Reflection: Plan is comprehensive and ready for task generation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All constitution gates PASS
- Prompt variant (if applicable): Standard plan creation
- Next experiment (smallest change to try): Proceed to /sp.tasks for task generation
