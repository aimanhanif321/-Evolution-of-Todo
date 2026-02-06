---
id: PHR-003
title: Advanced Todo Features Task Generation
stage: tasks
date: 2026-01-30
surface: cli
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.tasks
labels: [tasks, implementation, priorities, tags, search, filter, sort, recurring, due-dates, reminders]
links:
  spec: specs/004-advanced-todo-features/spec.md
  plan: specs/004-advanced-todo-features/plan.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/004-advanced-todo-features/tasks.md
tests:
  - N/A (task list document)
---

## Prompt

Run /sp.tasks to generate the implementation task list with dependencies and phases for Advanced Todo Features (004-advanced-todo-features).

## Response snapshot

Generated comprehensive implementation task list with 79 tasks across 11 phases:

**Task File**: `specs/004-advanced-todo-features/tasks.md`

### Phase Summary

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

### Key Features

- Tasks organized by user story for independent implementation
- [P] markers for parallelizable tasks (23 total)
- [US#] labels for traceability to user stories
- Clear dependency chain: Setup → Foundational → User Stories → Polish
- Checkpoints after each phase for validation
- MVP-first strategy: US1 (Priority) delivers immediate value
- Incremental delivery enables continuous deployment

### Task Dependencies

```
Phase 2 (Foundational) → US1 (Priority) → MVP!
                      → US2 (Tags)
                      → US3 (Search)
                      → US4 (Filter) - benefits from US1, US2
                      → US5 (Sort) - most useful after US6
                      → US6 (Due Dates)
                      → US7 (Recurring) - requires US6
                      → US8 (Reminders) - requires US6
```

### Design Document Sources

Tasks derived from:
- `spec.md`: 8 user stories with acceptance criteria
- `plan.md`: Project structure and file paths
- `research.md`: Implementation patterns and decisions
- `data-model.md`: Entity definitions and migrations
- `contracts/api-contracts.md`: API endpoints and schemas
- `quickstart.md`: Verification checklist

## Outcome

- Impact: HIGH - Actionable implementation roadmap for 8 user stories
- Tests: Manual verification via quickstart.md checklist
- Files: tasks.md generated with 79 implementation tasks
- Next prompts: `/sp.implement` to begin implementation execution
- Reflection: Task list is comprehensive with clear dependencies and parallel opportunities

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All tasks traceable to user stories
- Prompt variant (if applicable): Standard task generation
- Next experiment (smallest change to try): Proceed to /sp.implement for Phase 1 execution
