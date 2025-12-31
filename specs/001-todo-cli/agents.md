# Agent Definitions: Phase I - Todo CLI Application

**Feature Branch**: `001-todo-cli`
**Created**: 2025-12-30
**Scope**: Phase I only (in-memory, CLI, no persistence)

This document defines the agent architecture for the Todo CLI Application. Each agent has clearly scoped responsibilities, operates within Phase I constraints, and is designed for reusability across future phases.

---

## Agent Architecture Overview

```
                    ┌─────────────────┐
                    │   User Input    │
                    │  (from CLI)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ CoordinatorAgent│
                    │  (Orchestrator) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────────┐┌────────────────┐┌────────────────┐
     │TaskUnderstanding││StateReasoning ││  (Reserved)    │
     │     Agent       ││    Agent       ││  Future Agents │
     └────────────────┘└────────────────┘└────────────────┘
```

---

## 1. CoordinatorAgent

**Classification**: Primary Agent (Root)
**Type**: Orchestrator
**Scope Phase**: All phases (extensible)
**Dependencies**: TaskUnderstandingAgent, StateReasoningAgent

### Responsibility Summary

The CoordinatorAgent serves as the central entry point and orchestrator for all user interactions. It does not contain business logic but delegates all actions to specialized sub-agents. This separation ensures the coordinator remains stable across phases while sub-agents evolve.

### Core Responsibilities

| Responsibility | Description | Boundary |
|---------------|-------------|----------|
| Input Reception | Receives all raw user input from the CLI interface | Never processes input content directly |
| Agent Delegation | Routes requests to appropriate sub-agents based on intent | No business logic execution |
| Response Aggregation | Collects results from sub-agents and formats for CLI output | No data transformation |
| Session Lifecycle | Manages the overall session state (startup, idle, exit) | Only session-level state |
| Error Routing | Delegates errors to appropriate agents for handling | Never handles errors directly |

### Input Contract

The CoordinatorAgent receives raw string input from the CLI with no preprocessing.

```
Input: { "raw": "<user input string>", "session_id": "<unique session identifier>" }
```

### Output Contract

The CoordinatorAgent produces formatted output suitable for CLI display.

```
Output: { "display": "<formatted response>", "status": "success|error", "agent": "<source agent>" }
```

### Behavioral Constraints

1. **Must Not** contain task validation logic
2. **Must Not** make decisions about task state transitions
3. **Must Not** interpret user intent (delegates to TaskUnderstandingAgent)
4. **Must Not** persist data or manage in-memory state (delegates to StateReasoningAgent)

### Phase I Scope

- Single active sub-agent call per user input (no parallel delegation)
- Synchronous response handling only
- No skill invocation (reserved for future phases)
- No command history or undo/redo management

### Extensibility Points (Future Phases)

- Parallel sub-agent invocation for complex queries
- Skill registry and dynamic skill loading
- Command history and undo/redo coordination
- Multi-user session management

---

## 2. TaskUnderstandingAgent

**Classification**: Sub-Agent
**Type**: Interpreter / Validator
**Scope Phase**: Phase I (with extensibility)
**Dependencies**: StateReasoningAgent (for validation queries)

### Responsibility Summary

The TaskUnderstandingAgent interprets user intent, validates that requests comply with Phase I rules, and translates natural language input into structured actions. It serves as the translation layer between user communication and system operations.

### Core Responsibilities

| Responsibility | Description | Boundary |
|---------------|-------------|----------|
| Intent Classification | Identifies the action type (add, update, delete, view, mark) | Returns enum: ADD, UPDATE, DELETE, VIEW, MARK_COMPLETE, MARK_INCOMPLETE |
| Parameter Extraction | Extracts task ID and content from user input | Returns structured parameters |
| Intent Validation | Validates intent against Phase I supported operations | Rejects unsupported intents |
| Input Sanitization | Normalizes whitespace, trims content | No content modification beyond whitespace |
| Rule Checking | Validates against Phase I business rules | Empty content, invalid ID formats |

### Input Contract

```
Input: {
  "raw": "<user input string>",
  "context": {
    "session_id": "<unique session identifier>",
    "task_count": <number of tasks in session>
  }
}
```

### Output Contract

```
Output: {
  "intent": "ADD|UPDATE|DELETE|VIEW|MARK_COMPLETE|MARK_INCOMPLETE",
  "parameters": {
    "task_id": <integer or null>,
    "content": "<sanitized content or null>"
  },
  "validation": {
    "valid": true,
    "errors": []  // Empty if valid, populated if invalid
  }
}
```

### Intent Specifications (Phase I)

| Intent | Format | Parameters |
|--------|--------|------------|
| ADD | "add <content>" or "new <content>" | content: string (required) |
| UPDATE | "update <id> <content>" or "edit <id> <content>" | task_id: int, content: string |
| DELETE | "delete <id>" or "remove <id>" or "del <id>" | task_id: int |
| VIEW | "list" or "view" or "show" | none |
| MARK_COMPLETE | "complete <id>" or "done <id>" or "check <id>" | task_id: int |
| MARK_INCOMPLETE | "incomplete <id>" or "undone <id>" | task_id: int |

### Validation Rules (Phase I)

1. **ADD Validation**:
   - Content must not be empty after whitespace trimming
   - Content must not consist only of whitespace

2. **UPDATE Validation**:
   - Task ID must be a positive integer
   - Content must not be empty after whitespace trimming

3. **DELETE Validation**:
   - Task ID must be a positive integer
   - Task ID must reference an existing task (delegated to StateReasoningAgent)

4. **VIEW Validation**:
   - No validation required

5. **MARK Validation**:
   - Task ID must be a positive integer
   - Task ID must reference an existing task (delegated to StateReasoningAgent)

### Error Response Format

When validation fails:

```
{
  "intent": null,
  "parameters": {},
  "validation": {
    "valid": false,
    "errors": [
      { "code": "<ERROR_CODE>", "message": "<human-readable message>" }
    ]
  }
}
```

### Error Codes (Phase I)

| Code | Condition |
|------|-----------|
| EMPTY_CONTENT | Task content is empty or whitespace-only |
| MISSING_CONTENT | ADD/UPDATE requires content parameter |
| MISSING_ID | Operations requiring task ID have no ID |
| INVALID_ID_FORMAT | Task ID is not a positive integer |
| UNRECOGNIZED_INTENT | Input does not match any Phase I pattern |

### Phase I Constraints

- Only 6 intents supported (no search, filter, bulk operations)
- No natural language understanding beyond pattern matching
- No context-aware interpretation (each input processed independently)
- No synonyms beyond specified patterns

### Extensibility Points (Future Phases)

- Natural language understanding integration
- Context-aware intent resolution
- Intent aliases and user customization
- Multi-language support

---

## 3. StateReasoningAgent

**Classification**: Sub-Agent
**Type**: State Manager / Validator
**Scope Phase**: Phase I (with extensibility)
**Dependencies**: None (self-contained state)

### Responsibility Summary

The StateReasoningAgent manages and reasons about the in-memory task state. It validates task existence, ensures state transitions are valid, and guarantees deterministic behavior by maintaining strict rules about task identity and lifecycle.

### Core Responsibilities

| Responsibility | Description | Boundary |
|---------------|-------------|----------|
| State Management | Maintains in-memory task collection | Single session only |
| Identity Management | Ensures unique sequential task IDs | ID never reused after deletion |
| Existence Validation | Validates task IDs reference existing tasks | Returns boolean + task data |
| Transition Validation | Ensures state transitions are valid | Complete/incomplete toggles only |
| Determinism Enforcement | Guarantees identical outputs for identical inputs | No random or time-based behavior |
| State Querying | Provides task state for display and operations | Read-only access to state |

### Internal State Structure

The StateReasoningAgent maintains an in-memory task registry:

```
State: {
  "tasks": {
    <task_id>: {
      "id": <positive integer>,
      "content": "<non-empty string>",
      "complete": <boolean>
    }
  },
  "next_id": <positive integer, next ID to assign>,
  "deterministic_seed": null  // Reserved for future phases
}
```

### Input Contract

```
Input: {
  "action": "CREATE|READ|UPDATE|DELETE|QUERY|TRANSITION",
  "parameters": { ...action-specific parameters... },
  "session_id": "<unique session identifier>"
}
```

### Action Specifications

| Action | Parameters | Returns |
|--------|------------|---------|
| CREATE | content: string | { task: { id, content, complete } } |
| READ | none | { tasks: [ ...all tasks... ] } |
| UPDATE | task_id: int, content: string | { task: { id, content, complete } } |
| DELETE | task_id: int | { deleted: true } |
| QUERY | task_id: int | { task: { id, content, complete } or null } |
| TRANSITION | task_id: int, complete: boolean | { task: { id, content, complete } } |

### Output Contract

```
Output: {
  "success": true,
  "data": { ...action result... },
  "state_version": <incrementing version for tracking>
}
```

Error response:

```
Output: {
  "success": false,
  "error": {
    "code": "<ERROR_CODE>",
    "message": "<human-readable message>"
  }
}
```

### Error Codes (Phase I)

| Code | Condition |
|------|-----------|
| TASK_NOT_FOUND | Task ID does not exist in state |
| INVALID_ID | Task ID is out of valid range |
| INVALID_CONTENT | Content validation failed |
| NO_STATE_CHANGE | Transition would not change state |
| STATE_CORRUPTED | Internal state is inconsistent |

### Determinism Guarantees

The StateReasoningAgent enforces deterministic behavior through:

1. **Sequential ID Assignment**: Next ID always increments by 1, never skipped or random
2. **No Time-Based Ordering**: Tasks ordered by ID, not creation timestamp
3. **Pure Operations**: Same input always produces same output
4. **No Randomization**: No random values, shuffle, or non-deterministic sorting

### State Lifecycle (Phase I)

| Event | State Effect |
|-------|--------------|
| Application Start | Empty state, next_id = 1 |
| CREATE | Add task, increment next_id |
| UPDATE | Modify task content |
| DELETE | Remove task from collection |
| TRANSITION | Toggle complete status |
| Application Exit | State discarded (no persistence) |

### Phase I Constraints

- In-memory only (no persistence layers)
- Single-user session only
- No sorting options (fixed by ID order)
- No filtering or search
- No undo/redo capability

### Extensibility Points (Future Phases)

- Persistent storage backends
- Sorting and filtering options
- Undo/redo with state snapshots
- Multi-session state sharing
- Deterministic seed for replay/debugging

---

## Agent Interaction Flow

### Successful User Request Flow

```
1. CLI → CoordinatorAgent: Raw user input
2. CoordinatorAgent → TaskUnderstandingAgent: Parse intent
3. TaskUnderstandingAgent → CoordinatorAgent: Structured action
4. CoordinatorAgent → StateReasoningAgent: Execute action
5. StateReasoningAgent → CoordinatorAgent: Result
6. CoordinatorAgent → CLI: Formatted output
```

### Validation Error Flow

```
1. CLI → CoordinatorAgent: Raw user input
2. CoordinatorAgent → TaskUnderstandingAgent: Parse intent
3. TaskUnderstandingAgent → CoordinatorAgent: Validation errors
4. CoordinatorAgent → CLI: Error message (no StateReasoningAgent call)
```

### Not Found Error Flow

```
1. CLI → CoordinatorAgent: Raw user input
2. CoordinatorAgent → TaskUnderstandingAgent: Parse intent
3. TaskUnderstandingAgent → CoordinatorAgent: Valid action
4. CoordinatorAgent → StateReasoningAgent: Execute action
5. StateReasoningAgent → CoordinatorAgent: TASK_NOT_FOUND error
6. CoordinatorAgent → CLI: Error message
```

---

## Phase I Exclusion Notes

The following are explicitly excluded from Phase I agent definitions:

- **CoordinatorAgent**: Skill invocation, parallel processing, command history
- **TaskUnderstandingAgent**: Natural language understanding, context awareness, custom aliases
- **StateReasoningAgent**: Persistence, sorting, filtering, undo/redo, state snapshots

These will be addressed in future phase specifications.

---

## Consistency with Constitution

All agent definitions adhere to the Project Constitution principles:

| Principle | Application |
|-----------|-------------|
| Single Responsibility | Each agent has one clearly defined purpose |
| Testability | Each agent can be tested in isolation |
| Extensibility | Future phases can extend without modification |
| No Implementation Details | Definitions are responsibility-only, no code |
