---
id: PHR-003
title: Phase VI Advanced Todo Features Constitution
stage: constitution
date: 2026-01-29
surface: cli
model: claude-opus-4-5-20251101
feature: phase-vi-advanced-features
branch: 003-doks-dapr-kafka
user: developer
command: /sp.constitution
labels: [constitution, phase-vi, advanced-features, priorities, tags, recurring, reminders]
links:
  spec: .specify/memory/constitution.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

You are a senior full-stack engineer and product designer.

I am building a modern Todo List Web App (React + Node.js or any clean stack you prefer).
My current app already supports:

Add / delete / complete tasks

Now I want you to upgrade it to an intermediate + advanced level product with the following features:

1. Organization & Usability (Intermediate)
a) Priorities & Tags

Each task must have:

Priority: High / Medium / Low

Tags or Categories: e.g. Work, Home, Study

UI:

Dropdown for priority

Tag input with colored badges

Data model update required.

b) Search & Filter

Implement:

Search tasks by keyword (title/description)

Filters:

By status (completed / pending)

By priority

By date range

c) Sorting

Allow sorting tasks by:

Due date

Priority

Alphabetical order (A-Z)

2. Intelligent Features (Advanced)
a) Recurring Tasks

Support repeating tasks:

Daily

Weekly

Monthly

When completed, auto-create next occurrence.

b) Due Dates & Reminders

Add:

Date & time picker

Browser notifications

Notify user before deadline (configurable).

3. AI + Smart Features (Bonus)
a) Multi-language Support

UI supports:

English

Urdu

Chatbot understands Urdu commands like:

"کل میٹنگ یاد دلانا"

"آج کے کام دکھاؤ"

b) Voice

## Response snapshot

Updated Taskora constitution from version 3.0.0 to 4.0.0 (MAJOR version bump) to define Phase VI: Advanced Todo Features.

**Key Changes:**

1. **Enhanced Task Model**: Added 7 new fields to Task entity:
   - `priority` (enum: low/medium/high/urgent)
   - `due_date` (datetime)
   - `reminder_at` (datetime)
   - `is_recurring` (bool)
   - `recurrence_rule` (enum: daily/weekly/monthly/custom)
   - `recurrence_interval` (int)
   - `parent_task_id` (FK for recurring task lineage)

2. **New Tag Model**: Created Tag entity with many-to-many relationship via TaskTag junction table

3. **Intermediate Features Defined**:
   - Priorities with colored badges (Gray/Blue/Orange/Red)
   - Tags with user-defined colors and autocomplete
   - Full-text search across title/description
   - Compound filters (status, priority, tags, date range)
   - Multi-field sorting (created, due date, priority, alphabetical)

4. **Advanced Features Defined**:
   - Recurring tasks with auto-generation on completion
   - Due dates with relative time display and overdue indicators
   - Browser notification reminders with configurable timing

5. **Bonus Features Deferred**: Multi-language (English/Urdu) and voice input planned for Phase VII

6. **UI/UX Guidelines**: Added component specifications for updated TaskForm, TaskCard, and TaskList with responsive breakpoints

7. **API Contracts**: Documented updated endpoints and request/response schemas

8. **Event Schema Updates**: Added `task.recurred` and `task.reminder` event types

9. **Database Migration**: Provided SQL migration script outline

## Outcome

- Impact: MAJOR - Defines comprehensive feature requirements for Phase VI transformation from basic CRUD to intelligent task management
- Tests: N/A (governance document)
- Files: `.specify/memory/constitution.md` updated
- Next prompts: `/sp.specify` to create feature specification, then `/sp.plan` for implementation planning
- Reflection: Constitution provides complete blueprint for implementing priorities, tags, search/filter/sort, recurring tasks, due dates, and reminders

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): Standard constitution update
- Next experiment (smallest change to try): Implement features incrementally starting with data model migration
