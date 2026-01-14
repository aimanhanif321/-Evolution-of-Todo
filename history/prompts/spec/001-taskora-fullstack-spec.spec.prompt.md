---
id: "001-taskora-fullstack-spec"
stage: spec
feature: "Taskora"
date: "2026-01-11"
title: "Taskora Full-Stack Todo Web Application Specification"
---

# Taskora Full-Stack Todo Web Application Specification

## PROMPT_TEXT

Read and fully understand Taskora Phase II scope ONLY.
Before doing anything, read and strictly follow the Project Constitution.
Confirm comprehension of every aspect:
1. PROJECT SCOPE
- Brand new Todo Web App (Phase II). Phase I console app is COMPLETE and MUST NOT be referenced.
- Application name: Taskora
- Multi-user, full-stack web application
- Monorepo structure:
  /specs/, /frontend/, /backend/, /CLAUDE.md, /frontend/CLAUDE.md, /backend/CLAUDE.md
2. FRONTEND (Next.js 16+, TypeScript, Tailwind CSS)
- Modern SaaS-style responsive UI
- Mobile-first design
- Pages/components:
  - Hero section: landing/intro
  - Sidebar & navbar: app navigation
  - Task list: todo-list-ui
  - Task actions: todo-action-button
  - Cards/buttons: modern-card, modern-button
  - Authentication pages: auth-ui-login, auth-ui-register
  - Auth flows & states: auth-ui-states, auth-ux-flows
- Loading, empty, and error states
- Visual consistency: spacing, colors, typography
- API calls via centralized client (`/lib/api.ts`)
3. BACKEND (FastAPI + SQLModel)
- RESTful API under `/api/*`
- JSON responses only
- CRUD endpoints for tasks:
  - GET /api/{user_id}/tasks → list all tasks for user
  - POST /api/{user_id}/tasks → create a new task
  - GET /api/{user_id}/tasks/{id} → task details
  - PUT /api/{user_id}/tasks/{id} → update task
  - DELETE /api/{user_id}/tasks/{id} → delete task
  - PATCH /api/{user_id}/tasks/{id}/complete → toggle completion
- Each API request requires JWT token
- Backend validates JWT, decodes user_id
- 401 Unauthorized for missing/invalid JWT
- Only the authenticated user can access/modify their own tasks
4. DATABASE (Neon Serverless PostgreSQL)
- Persistent storage only
- Schema matches @specs/database/schema.md
- Tables:
  - users: id, email, name, created_at
  - tasks: id, user_id, title, description, completed, created_at, updated_at
- Indexed fields: user_id, completed

## RESPONSE_TEXT

Successfully created the feature specification for Taskora Full-Stack Todo Web Application at specs/002-fullstack-todo-app/spec.md.

The specification includes:
1. Three prioritized user stories covering:
   - User registration and login (P1)
   - Task management (P2)
   - Secure multi-user isolation (P3)
2. Comprehensive functional requirements (FR-001 through FR-012)
3. Key entities (User and Task)
4. Measurable success criteria (SC-001 through SC-006)
5. Edge cases identification

Also created a quality checklist at specs/002-fullstack-todo-app/checklists/requirements.md to validate the specification completeness. Created a new git branch '002-fullstack-todo-app' and committed the specification files. The specification follows the Project Constitution requirements and focuses on user value without leaking implementation details into the specification.