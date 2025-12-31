---
id: 001
title: Create Project Constitution Phase I
stage: constitution
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: human
command: /sp.constitution
labels: [constitution,project-governance,hackathon]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

You are operating under Spec-Kit Plus.

Task: Generate the FINAL Project Constitution for Hackathon II – Phase I.

Project Context:
- Python-based Todo CLI application
- Phase I only
- Spec-Driven Development (SDD)
- Agent-based architecture
- Human acts as Product Architect, not a programmer

Strict Rules:
- DO NOT write any code
- DO NOT implement agents, sub-agents, or skills
- NO vibe coding, NO manual coding
- Output must be a formal constitution document

The constitution MUST define:

1. Non-negotiable rules:
   - No manual code editing
   - All code generated only by Claude Code
   - Bugs fixed via spec refinement only

2. Spec-first governance:
   - All behavior defined in markdown specs
   - No code without approved spec
   - Specs versioned in /specs-history

3. Agent-based architecture principles:
   - One Coordinator Agent
   - Multiple Sub-Agents with specialized roles
   - Skills as stateless, reusable behaviors
   - Agents orchestrate, skills execute
   - Business logic must live in skills, not agents

4. Reusability rule:
   - Agents, sub-agents, and skills defined in Phase I
     must be extended in later phases, never recreated

5. Phase I constraints:
   - Python 3.13+
   - CLI only
   - In-memory data only
   - No database, no files, no APIs, no UI

6. Functional scope (Phase I only):
   - Add task
   - Delete task
   - Update task
   - View tasks
   - Mark complete / incomplete

7. Determinism & quality:
   - Deterministic behavior
   - Clean, modular architecture
   - Clear CLI prompts
   - Graceful error handling

8. Repository governance:
   - /src for AI-generated code
   - /specs-history for spec versions
   - CONSTITUTION.md, CLAUDE.md, README.md required

Output Requirements:
- Output ONLY the constitution
- No explanations
- No commentary
- No code

## Response snapshot

Created the initial Project Constitution document at `.specify/memory/constitution.md` (v1.0.0). The constitution establishes:

- **Non-negotiable rules**: No manual code editing, all code via Claude Code, bug fixes via spec refinement
- **Spec-first governance**: Markdown specs required, no code without approval, versioned in specs-history
- **Agent-based architecture**: Single Coordinator, specialized Sub-Agents, stateless Skills, clear separation of concerns
- **Reusability mandate**: Phase I artifacts extended never recreated
- **Phase I constraints**: Python 3.13+, CLI-only, in-memory only, no external dependencies
- **Functional scope**: Add/delete/update/view tasks, mark complete/incomplete
- **Quality standards**: Deterministic behavior, clean modular architecture, clear CLI, graceful errors
- **Repository governance**: /src for code, /specs-history for versions, required docs (CONSTITUTION.md, CLAUDE.md, README.md)

## Outcome

- ✅ Impact: Project governance framework established for Hackathon II Phase I
- 🧪 Tests: N/A (constitution document, not code)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Create feature specifications per constitution guidelines
- 🧠 Reflection: First governance document for the project, sets foundation for SDD methodology

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
