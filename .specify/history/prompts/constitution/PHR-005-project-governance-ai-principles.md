---
id: PHR-005-project-governance-ai-principles
title: Project Governance AI Principles
stage: constitution
date: 2026-02-04
surface: cli
model: claude-opus-4-5-20251101
feature: N/A
branch: 004-advanced-todo-features
user: N/A
command: /sp.constitution
labels: [governance, phase-v, deduplication, dependency-sequencing, gap-analysis]
links:
  spec: N/A
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Role: You are the Project Governance AI. Your responsibility is to fully understand the Phase V project document and establish rules for all project actions.

Objective: Create a governing constitution that ensures all project tasks, plans, and implementation steps are:

- Fully understood before execution
- Deduplicated (no repeated tasks)
- Corrected if existing tasks have issues
- New tasks created only if missing
- Organized hierarchically: Constitution -> Specs -> Plan -> Tasks -> Implementation

Rules & Guidelines:

1. Understand First: Read the entire document before taking any action. Do not assume anything.
2. Deduplication: Never create duplicate tasks or steps. Merge overlapping items.
3. Dependencies: Identify tasks that rely on others; sequence tasks accordingly.
4. Gaps: If the document misses a required step, feature, or component, create a new task with justification.
5. Hierarchy: Maintain the structure:
   - Phase A - Advanced Features
   - Phase B - Local Deployment
   - Phase C - Cloud Deployment

Kafka Topic requirements for Phase V.

## Response snapshot

Updated constitution from v5.0.0 to v5.1.0 (MINOR version bump) with the following additions:

### New Sections Added (Part X: PROJECT GOVERNANCE AI)

**Section 30: GOVERNANCE HIERARCHY**
- Document hierarchy diagram: Constitution -> Specifications -> Plans -> Tasks -> Implementation
- Hierarchy rules ensuring lower-level documents cannot contradict higher-level documents

**Section 31: UNDERSTANDING-FIRST PRINCIPLE**
- Non-negotiable rule requiring AI to read all relevant documents before taking action
- 5-step understanding protocol with validation checkpoints
- Explicit violations defined

**Section 32: DEDUPLICATION ENFORCEMENT**
- Protocol for checking existing artifacts before creating new ones
- 30% overlap threshold for merge decisions
- Merge template for documenting consolidated tasks

**Section 33: DEPENDENCY SEQUENCING**
- Dependency types: Hard (->), Soft (-->), Parallel (||), Conflict (x)
- Topological sort algorithm for execution order
- Phase alignment: Phase A (Advanced Features) -> Phase B (Local Deployment) -> Phase C (Cloud Deployment)

**Section 34: GAP ANALYSIS PROTOCOL**
- Gap detection checklist
- Gap creation template with type, discovery method, justification
- Gap categories with default priorities

**Section 35: PHASE ALIGNMENT RULES**
- Phase V compliance matrix (DOKS, Dapr, Kafka, CI/CD, Local Dev Parity)
- Phase cross-reference table
- Task alignment validation steps

### Additional Sections

**Part XI: EXECUTION RULES (Section 36)**
- AI Agent Operating Rules for before/during/after execution

**Part XII: KAFKA TOPIC ARCHITECTURE (Section 37)**
- Topic naming convention, partitions, retention
- CloudEvents schema format
- Consumer groups

## Outcome

- Impact: MINOR version bump (5.0.0 -> 5.1.0) - new governance sections added
- Tests: N/A (documentation only)
- Files: .specify/memory/constitution.md updated
- Next prompts: Validate existing tasks.md files against deduplication rules; Run gap analysis on Phase V/VI/VII artifacts
- Reflection: The Project Governance AI principles provide a systematic framework for ensuring task quality and preventing duplicates. The hierarchical structure (Constitution -> Specs -> Plan -> Tasks -> Implementation) establishes clear authority levels for all project artifacts.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Apply deduplication rules to existing Phase VI tasks.md to validate the protocol
