<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial creation)
Added sections:
  - Non-Negotiable Rules
  - Spec-First Governance
  - Agent-Based Architecture Principles
  - Reusability Rule
  - Phase I Constraints
  - Functional Scope (Phase I)
  - Determinism and Quality Standards
  - Repository Governance
Templates requiring updates: None (constitution is the authoritative source)
Follow-up TODOs: None
-->

# Project Constitution: Evolution of Todos

**Constitution Version**: 1.0.0
**Ratification Date**: 2025-12-30
**Last Amended Date**: 2025-12-30
**Phase**: I (Hackathon II)

## Purpose

This constitution establishes the governing principles for the Evolution of Todos project, a Python-based Todo CLI application developed under Spec-Driven Development (SDD). All contributors, agents, and automated systems MUST adhere to these principles. The human architect serves as Product Architect, not a programmer, providing high-level direction while AI agents execute implementation tasks.

## Non-Negotiable Rules

### NR-001: No Manual Code Editing

Human contributors MUST NOT directly edit source code files in `/src` or any generated code location. All code modifications MUST be requested through the specified agent workflow, which ensures the change is captured in a Prompt History Record (PHR) and properly tested.

**Rationale**: Manual edits bypass the specification-driven workflow, create inconsistencies between specs and implementation, and violate the SDD contract. Automated code generation ensures traceability and enables refactoring without human error.

### NR-002: All Code Generated Only by Claude Code

All source code, tests, configuration files, and artifacts MUST be generated exclusively by Claude Code using the defined agent commands (`/sp.specify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`, etc.). No third-party code generation tools, manual scaffolding, or boilerplate from external sources may be introduced without architect approval.

**Rationale**: Claude Code maintains the specification-to-implementation trace, ensures consistency with architectural decisions, and preserves the integrity of the SDD methodology. External code introduces unknown dependencies and potential security risks.

### NR-003: Bugs Fixed Via Spec Refinement Only

When bugs are discovered, the solution MUST NOT be ad-hoc code patches. Instead, the relevant specification MUST be updated to correctly describe the intended behavior, and the implementation MUST be regenerated to conform to the revised spec. This applies to all defect categories: logic errors, edge case handling, and behavioral inconsistencies.

**Rationale**: Bug patches without spec updates create drift between intended and actual behavior. Updating specs ensures the specification remains the authoritative source of truth and prevents regression through regeneration.

## Spec-First Governance

### SG-001: All Behavior Defined in Markdown Specs

Every functional behavior, user interaction, error condition, and edge case MUST be documented in a markdown specification file before implementation. Specifications MUST use the format defined in `.specify/templates/spec-template.md` and include user stories, acceptance scenarios, functional requirements, and success criteria.

**Rationale**: Specifications serve as the contract between architect intent and implementation. They enable independent review, provide regression test targets, and serve as documentation for future enhancements.

### SG-002: No Code Without Approved Spec

Implementation work MUST NOT begin until the corresponding feature specification has been created, reviewed, and approved by the architect. The specification MUST be stored in `specs/<feature-name>/spec.md` with status marked as "Approved."

**Rationale**: Prevents scope creep, ensures architectural alignment, and provides a clear definition of done for each feature. Approval creates a checkpoint for quality and completeness.

### SG-003: Specs Versioned in /specs-history

All specification versions MUST be preserved in `specs-history/<feature-name>/` with version suffixes. When a spec is amended, the previous version MUST be archived rather than overwritten. Each version change MUST be documented with a change summary.

**Rationale**: Versioned specs enable audit trails, support rollback to known-good states, and provide historical context for architectural decisions. They are essential for compliance and debugging spec-to-implementation drift.

## Agent-Based Architecture Principles

### AA-001: One Coordinator Agent

The system MUST operate through a single Coordinator Agent that orchestrates all sub-agents and skills. The Coordinator Agent handles user intent parsing, workflow sequencing, and output synthesis. There MUST NOT be multiple independent coordinators that could create conflicting execution paths.

**Rationale**: A single coordinator ensures consistent response patterns, simplifies debugging, and maintains a clear chain of execution. Multiple coordinators would introduce nondeterminism and make traceability impossible.

### AA-002: Multiple Sub-Agents with Specialized Roles

Sub-Agents MAY be defined for specific domains (e.g., `sp.specify` for feature specification, `sp.plan` for architecture design, `sp.implement` for code generation). Each sub-agent has a defined scope and MUST NOT exceed its boundaries without Coordinator orchestration. Sub-agents MUST be declared in the `.claude/commands/` directory.

**Rationale**: Specialization enables focused expertise, prevents scope ambiguity, and supports independent testing of each agent's domain. Clear boundaries ensure maintainability as the system grows.

### AA-003: Skills as Stateless, Reusable Behaviors

Skills are stateless, composable units of functionality that perform specific operations. Skills MUST NOT maintain internal state between invocations. All state MUST be managed by the calling agent or stored in the designated in-memory data structure. Skills MUST be idempotent and accept all required inputs as parameters.

**Rationale**: Stateless skills are inherently testable, composable, and reusable. They eliminate hidden dependencies and enable parallel execution. Idempotency ensures safe retries and deterministic behavior.

### AA-004: Agents Orchestrate, Skills Execute

Agents are responsible for workflow coordination, decision-making, and state management. Skills are responsible for isolated, well-defined operations. Business logic MUST live in skills, not in agent implementations. Agents MUST delegate all computation and transformation to skills.

**Rationale**: Separation of concerns enables skill reuse across different workflows, simplifies skill testing in isolation, and prevents agent bloat. Business logic in skills ensures consistency regardless of which agent invokes the skill.

### AA-005: Business Logic Must Live in Skills, Not Agents

Any logic that manipulates data, performs calculations, or implements domain rules MUST be encapsulated in a skill. Agents MAY contain only orchestration logic: sequencing calls, aggregating results, and handling errors at the workflow level.

**Rationale**: Skills are the units of reuse and testing. Business logic in skills can be invoked by any agent, including future agents not yet defined. Agent-only logic becomes locked to specific workflows.

## Reusability Rule

### RR-001: Phase I Artifacts Extended, Never Recreated

All agents, sub-agents, and skills defined during Phase I MUST be extended in later phases rather than recreated. When Phase II or beyond requires new capabilities, the Phase I definitions MUST serve as the base class, interface, or foundation. This applies to skill interfaces, agent patterns, and data structures.

**Rationale**: Recreation breaks the evolutionary contract, discards accumulated testing coverage, and introduces unnecessary rewrite risk. Extension preserves investment and enables cumulative improvement across phases.

### RR-002: Interface Stability Requirement

All skill interfaces and agent contracts defined in Phase I MUST remain stable across subsequent phases. Breaking changes to interfaces MUST NOT be introduced. If a Phase I interface proves inadequate, a new interface MUST be created, and the old one MUST be deprecated with a migration path.

**Rationale**: Stable interfaces enable independent evolution of components. They allow teams to work in parallel and prevent cascading rewrites when one component changes.

## Phase I Constraints

### PC-001: Python 3.13+

All source code MUST be written in Python 3.13 or higher. Type hints MUST be used throughout. The minimum Python version MAY be enforced via `pyproject.toml` or `setup.py` configuration.

**Rationale**: Python 3.13 provides the latest language features, performance improvements, and security updates. Type hints enable static analysis and improve code quality.

### PC-002: CLI Only

The application MUST be a command-line interface tool with no graphical user interface, web interface, or interactive visual components. All user interactions MUST occur through terminal input and output.

**Rationale**: Phase I focuses on core functionality without UI complexity. CLI-only constraints simplify development and ensure portability across environments.

### PC-003: In-Memory Data Only

All data storage MUST be in-memory only during Phase I. No files, databases, or persistent storage mechanisms of any kind MAY be used. Data structures MUST be Python objects in memory. Session termination results in data loss.

**Rationale**: In-memory storage eliminates file I/O complexity, enables rapid prototyping, and focuses development on core domain logic. Persistence is deferred to a later phase.

### PC-004: No External APIs, No Database, No Files

The application MUST NOT make network requests to external services, connect to databases, or read/write files. All dependencies MUST be limited to the Python standard library unless explicitly approved by the architect.

**Rationale**: Eliminating external dependencies ensures deterministic behavior, simplifies deployment, and removes failure modes. It also ensures Phase I remains focused on the core todo domain.

## Functional Scope (Phase I)

### FS-001: Add Task

Users MUST be able to create new tasks with a description. Tasks MUST be assigned a unique identifier upon creation. The system MUST validate that descriptions are non-empty.

### FS-002: Delete Task

Users MUST be able to remove existing tasks by identifier. Deletion MUST handle both existing and non-existing identifiers gracefully with appropriate feedback.

### FS-003: Update Task

Users MUST be able to modify task descriptions and other attributes. Updates MUST validate input and maintain data integrity. The system MUST provide feedback on update success or failure.

### FS-004: View Tasks

Users MUST be able to list all tasks. The display MUST show task status (complete/incomplete), identifiers, and descriptions. Output formatting MUST be clear and readable.

### FS-005: Mark Complete / Incomplete

Users MUST be able to change task completion status. The system MUST distinguish between complete and incomplete states and reflect this in task views.

## Determinism and Quality Standards

### DQ-001: Deterministic Behavior

For any given input, the system MUST produce identical output every time. Randomness, unless explicitly required and controlled, MUST NOT be introduced. Seed values MUST be used if stochastic behavior is necessary.

**Rationale**: Determinism enables reliable testing, simplifies debugging, and ensures consistent user experience. Non-deterministic behavior makes regression detection impossible.

### DQ-002: Clean, Modular Architecture

Code MUST be organized into discrete modules with single responsibilities. Functions SHOULD be small (<20 lines preferred). Classes SHOULD have focused interfaces. Dependencies MUST be explicit and minimized.

**Rationale**: Modularity enables independent testing, supports refactoring, and improves maintainability. Clear boundaries reduce cognitive load during development and review.

### DQ-003: Clear CLI Prompts

User-facing messages MUST be clear, concise, and grammatically correct. Error messages MUST describe the problem and, where applicable, suggest remediation. Help text MUST be accessible and complete.

**Rationale**: Clear communication reduces user errors and support burden. Consistent messaging builds trust and professionalism.

### DQ-004: Graceful Error Handling

All error conditions MUST be handled explicitly. The application MUST NOT crash or produce uncaught exceptions. Errors MUST be logged appropriately and communicated to users in actionable terms. The system MUST recover or fail safely.

**Rationale**: Graceful handling prevents data loss, maintains user confidence, and enables automated error recovery. Silent failures or crashes indicate incomplete specification.

## Repository Governance

### RG-001: /src for AI-Generated Code

All source code MUST reside in the `/src` directory at the repository root. This includes modules, packages, and any generated Python files. No source code MAY exist outside `/src` except for project configuration files.

**Rationale**: Centralized source location simplifies build tooling, enables clear separation of source from configuration, and supports future expansion to multi-project structures.

### RG-002: /specs-history for Spec Versions

Archived specification versions MUST reside in `/specs-history/<feature-name>/`. Active specifications remain in `specs/<feature-name>/`. The directory structure MUST mirror the active specs location.

**Rationale**: Separation of active and archived specs maintains clarity while preserving historical versions. Parallel structure simplifies navigation and migration.

### RG-003: Required Documentation Files

The repository root MUST contain:
- `CONSTITUTION.md` - This document
- `CLAUDE.md` - Claude Code agent instructions
- `README.md` - Project overview and quick start

These files MUST be kept current and accurately reflect project state.

## Governance

### Amendment Procedure

This constitution MAY be amended through the following process:
1. Amendment proposal submitted to the architect
2. Impact analysis completed by the Coordinator Agent
3. Architect review and approval
4. Version increment per semantic versioning rules
5. PHR creation documenting the amendment
6. Notification to all stakeholders

### Versioning Policy

Constitution versions follow semantic versioning:
- **MAJOR**: Backward-incompatible changes to governance, principle removal, or principle redefinition
- **MINOR**: New principles added or existing guidance materially expanded
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

The Coordinator Agent MUST verify compliance with this constitution before:
- Marking a feature specification as "Approved"
- Accepting implementation work as complete
- Creating sub-agent or skill definitions

Non-compliance MUST be flagged and resolved before proceeding.

## Acknowledgment

By contributing to this project, all parties acknowledge and agree to be bound by the principles in this constitution. Violations MUST be corrected, not excused.

---

**End of Constitution**
