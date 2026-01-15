# Phase III Constitution: Todo AI Chatbot

**Project**: Taskora AI Chatbot Extension
**Phase**: III
**Created**: 2026-01-15
**Status**: Draft
**Predecessor**: Phase II Full-Stack Todo Web Application

---

## Table of Contents

1. [Objective](#objective)
2. [Core Principles](#core-principles)
3. [Golden Rules](#golden-rules)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Database Models](#database-models)
7. [API Specification](#api-specification)
8. [MCP Tools Specification](#mcp-tools-specification)
9. [Agent Behavior Rules](#agent-behavior-rules)
10. [Stateless Conversation Flow](#stateless-conversation-flow)
11. [Natural Language Command Mapping](#natural-language-command-mapping)
12. [Chatbot UI Specification](#chatbot-ui-specification)
13. [Security Requirements](#security-requirements)
14. [Error Handling](#error-handling)
15. [Deliverables](#deliverables)
16. [Completion Criteria](#completion-criteria)
17. [Prohibited Actions](#prohibited-actions)

---

## Objective

Build an AI-powered Todo chatbot extension for the existing Phase II Taskora project, enabling users to manage their tasks using natural language conversations. The system implements MCP (Model Context Protocol) tools for task operations, maintains complete statelessness on the server, and persists all state (tasks and conversations) in PostgreSQL. AI capabilities are powered by the **Gemini Free model**.

---

## Core Principles

### CP-001: Conversational Interface
The chatbot provides a natural, conversational interface where users can manage tasks through everyday language instead of explicit UI interactions.

### CP-002: AI-Driven Decision Making
The Gemini AI agent autonomously determines which operation to perform based on user intent analysis. The AI interprets natural language and maps it to appropriate MCP tool calls.

### CP-003: Complete Statelessness
The backend server maintains **zero state** between requests. All context, conversation history, and task data must be retrieved from and persisted to the database on every request.

### CP-004: Database as Single Source of Truth
All application state—including tasks, conversations, and messages—is stored exclusively in PostgreSQL (Neon Serverless). The server never caches or holds state in memory.

### CP-005: MCP Tool Exclusivity
The AI agent interacts with the application **only** through defined MCP tools. Direct database manipulation by the AI is strictly prohibited.

### CP-006: Non-Breaking Extension
Phase III extends the Phase II codebase **without breaking** existing functionality. All Phase II features, routes, and behaviors must remain fully operational.

### CP-007: Visual Consistency
The chatbot UI must seamlessly integrate with the existing frontend design system, matching colors, typography, spacing, and component styles.

---

## Golden Rules

These rules are **immutable** and must be followed without exception:

| Rule ID | Rule | Consequence of Violation |
|---------|------|--------------------------|
| GR-001 | Do NOT modify any Phase II working code | Breaks existing functionality |
| GR-002 | Do NOT rename or refactor existing files, routes, or database tables | Breaks existing functionality |
| GR-003 | Do NOT touch existing API endpoints | Breaks frontend integration |
| GR-004 | AI must ONLY use MCP tools for task operations | Violates architecture |
| GR-005 | Server must be completely stateless | Memory leaks, inconsistent state |
| GR-006 | All data must persist to PostgreSQL | Data loss |
| GR-007 | Chatbot UI must match existing theme | Visual inconsistency |
| GR-008 | Use Gemini Free model (not OpenAI) | Cost/licensing issues |

---

## Technology Stack

| Component | Technology | Version/Notes |
|-----------|------------|---------------|
| Frontend | Next.js + React | Existing Phase II setup |
| Chat UI | Custom components | Tailwind CSS, existing theme |
| Backend | Python FastAPI | Existing Phase II setup |
| AI Framework | Google Gemini | Free tier model |
| MCP Server | Official MCP SDK | Latest stable |
| ORM | SQLModel | Existing Phase II setup |
| Database | Neon Serverless PostgreSQL | Existing Phase II instance |
| Authentication | Better Auth (JWT) | Existing Phase II setup |

### New Dependencies (Phase III)

**Backend:**
- `google-generativeai` - Gemini AI SDK
- `mcp` - Model Context Protocol SDK

**Frontend:**
- No new dependencies required (use existing Tailwind/React)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Chat UI Component                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ Message List│  │ Input Box   │  │ Send Button     │   │  │
│  │  │ (scrollable)│  │             │  │ + Loading State │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/{user_id}/chat
                              │ (JWT authenticated)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   FastAPI Chat Endpoint                   │  │
│  │                                                           │  │
│  │  1. Validate JWT token                                    │  │
│  │  2. Fetch conversation history from DB                    │  │
│  │  3. Build message array                                   │  │
│  │  4. Store user message                                    │  │
│  │  5. Invoke Gemini Agent                                   │  │
│  │  6. Store assistant response                              │  │
│  │  7. Return response (stateless - forget everything)       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Gemini AI Agent                        │  │
│  │                                                           │  │
│  │  - Analyzes user intent                                   │  │
│  │  - Decides which MCP tool to call                         │  │
│  │  - Generates natural language response                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      MCP Server                           │  │
│  │                                                           │  │
│  │  Tools: add_task, list_tasks, complete_task,              │  │
│  │         delete_task, update_task                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEON POSTGRESQL                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  users   │  │  tasks   │  │ convers- │  │ messages │        │
│  │ (existing)│  │(existing)│  │  ations  │  │  (new)   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence

```
1. User types message in Chat UI
2. Frontend sends POST /api/{user_id}/chat with JWT
3. Backend validates JWT, extracts user_id
4. Backend fetches conversation history from DB
5. Backend stores user message in DB
6. Backend builds context array (history + new message)
7. Gemini Agent processes context
8. Agent calls appropriate MCP tool(s)
9. MCP tool executes against database
10. Agent generates natural language response
11. Backend stores assistant message in DB
12. Backend returns response to frontend
13. Server discards all in-memory state (stateless)
14. Chat UI displays response
```

---

## Database Models

### Existing Tables (DO NOT MODIFY)

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | NOT NULL |
| hashed_password | VARCHAR | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### tasks
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY → users.id |
| title | VARCHAR | NOT NULL |
| description | TEXT | NULLABLE |
| completed | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### New Tables (Phase III)

#### conversations
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() |

**Indexes:**
- `idx_conversations_user_id` ON (user_id)
- `idx_conversations_updated_at` ON (updated_at DESC)

#### messages
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| conversation_id | UUID | FOREIGN KEY → conversations.id, NOT NULL |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('user', 'assistant')) |
| content | TEXT | NOT NULL |
| tool_calls | JSONB | NULLABLE (stores MCP tool call metadata) |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Indexes:**
- `idx_messages_conversation_id` ON (conversation_id)
- `idx_messages_user_id` ON (user_id)
- `idx_messages_created_at` ON (created_at)

### SQLModel Definitions

```python
# models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List
import json

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    role: str = Field(nullable=False)  # 'user' or 'assistant'
    content: str = Field(nullable=False)
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
```

---

## API Specification

### Chat Endpoint

**Endpoint:** `POST /api/{user_id}/chat`

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's ID |

**Request Body:**
```json
{
  "conversation_id": "uuid-string-optional",
  "message": "string-required"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| conversation_id | UUID | No | Existing conversation ID. If omitted, creates new conversation |
| message | string | Yes | User's natural language message |

**Success Response (200 OK):**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "I've added 'Buy groceries' to your task list!",
  "tool_calls": [
    {
      "tool": "add_task",
      "params": {
        "user_id": "user-uuid",
        "title": "Buy groceries"
      },
      "result": {
        "task_id": "task-uuid",
        "status": "created",
        "title": "Buy groceries"
      }
    }
  ]
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| conversation_id | UUID | The conversation ID (new or existing) |
| response | string | AI-generated natural language response |
| tool_calls | array | List of MCP tools invoked (may be empty) |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Missing or invalid message |
| 401 | UNAUTHORIZED | Missing or invalid JWT token |
| 403 | FORBIDDEN | User ID mismatch (accessing another user's data) |
| 404 | NOT_FOUND | Conversation not found |
| 500 | INTERNAL_ERROR | AI/MCP processing error |

### Conversation History Endpoint (Optional)

**Endpoint:** `GET /api/{user_id}/conversations`

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T11:45:00Z",
      "message_count": 12
    }
  ]
}
```

### Conversation Messages Endpoint (Optional)

**Endpoint:** `GET /api/{user_id}/conversations/{conversation_id}/messages`

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Add a task to buy groceries",
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "I've added 'Buy groceries' to your task list!",
      "tool_calls": [...],
      "created_at": "2026-01-15T10:30:01Z"
    }
  ]
}
```

---

## MCP Tools Specification

### Tool: add_task

**Purpose:** Create a new task for the user

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |
| title | string | Yes | Task title |
| description | string | No | Task description |

**Returns:**
```json
{
  "task_id": "uuid",
  "status": "created",
  "title": "Task title"
}
```

**Trigger Phrases:**
- "Add a task..."
- "Create a task..."
- "Remember to..."
- "Don't forget to..."
- "I need to..."
- "Put ... on my list"

---

### Tool: list_tasks

**Purpose:** Retrieve user's tasks with optional filtering

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |
| status | string | No | Filter: "all", "pending", "completed" (default: "all") |

**Returns:**
```json
{
  "tasks": [
    {
      "task_id": "uuid",
      "title": "Task title",
      "description": "Description",
      "completed": false,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "count": 5
}
```

**Trigger Phrases:**
- "Show me my tasks"
- "List all tasks"
- "What's on my list?"
- "What do I need to do?"
- "What's pending?"
- "Show completed tasks"
- "What have I finished?"

---

### Tool: complete_task

**Purpose:** Mark a task as completed

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |
| task_id | UUID | Yes | The task ID to complete |

**Returns:**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "title": "Task title"
}
```

**Trigger Phrases:**
- "Mark task X as done"
- "Complete task X"
- "I finished..."
- "Done with..."
- "Task X is complete"
- "Check off..."

---

### Tool: delete_task

**Purpose:** Remove a task from the user's list

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |
| task_id | UUID | Yes | The task ID to delete |

**Returns:**
```json
{
  "task_id": "uuid",
  "status": "deleted",
  "title": "Task title"
}
```

**Trigger Phrases:**
- "Delete task X"
- "Remove task X"
- "Get rid of..."
- "I don't need... anymore"
- "Cancel task..."

---

### Tool: update_task

**Purpose:** Modify an existing task's details

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | The user's ID |
| task_id | UUID | Yes | The task ID to update |
| title | string | No | New title (if changing) |
| description | string | No | New description (if changing) |

**Returns:**
```json
{
  "task_id": "uuid",
  "status": "updated",
  "title": "Updated title"
}
```

**Trigger Phrases:**
- "Change task X to..."
- "Rename task X..."
- "Update task X..."
- "Edit task X..."
- "Modify..."

---

## Agent Behavior Rules

### Intent Recognition Matrix

| User Intent | Primary Tool | Secondary Tool |
|-------------|--------------|----------------|
| Add / remember / create task | add_task | - |
| Show / list / what tasks | list_tasks | - |
| Done / finished / complete | complete_task | list_tasks (if task ID unclear) |
| Delete / remove / cancel | delete_task | list_tasks (if task ID unclear) |
| Change / rename / update | update_task | list_tasks (if task ID unclear) |

### Response Guidelines

1. **Confirmation Messages:**
   - Always confirm actions in a friendly, natural tone
   - Include the task title in confirmations
   - Example: "Done! I've added 'Buy groceries' to your list."

2. **Ambiguity Resolution:**
   - If task reference is unclear, call list_tasks first
   - Ask for clarification in natural language
   - Example: "I found 3 tasks with 'meeting'. Which one did you mean?"

3. **Error Handling:**
   - Never expose technical errors to users
   - Provide helpful suggestions on failure
   - Example: "I couldn't find that task. Would you like to see your current tasks?"

4. **Empty States:**
   - Handle gracefully when no tasks exist
   - Example: "Your task list is empty. Would you like to add something?"

### Agent System Prompt

```
You are Taskora AI, a helpful task management assistant. You help users manage their todo list through natural conversation.

CAPABILITIES:
- Add new tasks (add_task)
- List tasks with optional filtering (list_tasks)
- Mark tasks as complete (complete_task)
- Delete tasks (delete_task)
- Update task details (update_task)

RULES:
1. Always be friendly and conversational
2. Confirm every action you take
3. If a user's request is ambiguous, ask for clarification
4. When referencing tasks by number, first call list_tasks to get current task IDs
5. Never make up task IDs - always verify they exist
6. Handle errors gracefully with helpful suggestions
7. Keep responses concise but informative

RESPONSE FORMAT:
- Use natural language, not technical jargon
- Include relevant task details in responses
- Offer helpful follow-up suggestions when appropriate
```

---

## Stateless Conversation Flow

### Request Processing Pipeline

```
┌────────────────────────────────────────────────────────────┐
│ Step 1: Receive Request                                     │
│ - Extract JWT token                                         │
│ - Validate user_id matches token                            │
│ - Parse conversation_id and message from body               │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 2: Load Conversation Context                           │
│ - If conversation_id provided: fetch from DB                │
│ - If not provided: create new conversation record           │
│ - Fetch last N messages for context (e.g., 20 messages)     │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 3: Store User Message                                  │
│ - Create new message record in DB                           │
│ - role: 'user'                                              │
│ - content: user's message                                   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 4: Build Agent Context                                 │
│ - System prompt (agent behavior rules)                      │
│ - Conversation history (from DB)                            │
│ - Current user message                                      │
│ - Available MCP tools                                       │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 5: Run Gemini Agent                                    │
│ - Send context to Gemini API                                │
│ - Agent analyzes intent                                     │
│ - Agent decides on tool calls (if any)                      │
│ - Agent generates response                                  │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 6: Execute MCP Tools (if needed)                       │
│ - Parse tool calls from agent response                      │
│ - Execute each tool against database                        │
│ - Collect tool results                                      │
│ - Feed results back to agent if needed                      │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 7: Store Assistant Response                            │
│ - Create new message record in DB                           │
│ - role: 'assistant'                                         │
│ - content: agent's response                                 │
│ - tool_calls: JSON of tools used                            │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Step 8: Return Response                                     │
│ - Return conversation_id, response, tool_calls              │
│ - Clear all in-memory state                                 │
│ - Server returns to stateless condition                     │
└────────────────────────────────────────────────────────────┘
```

### Context Window Management

- **Max History:** 20 most recent messages per conversation
- **Token Limit:** Respect Gemini's context window limits
- **Truncation Strategy:** Oldest messages dropped first

---

## Natural Language Command Mapping

### Task Creation Examples

| User Input | MCP Tool | Parameters |
|------------|----------|------------|
| "Add a task to buy groceries" | add_task | title: "buy groceries" |
| "Remember to call mom tomorrow" | add_task | title: "call mom tomorrow" |
| "I need to finish the report" | add_task | title: "finish the report" |
| "Put 'dentist appointment' on my list" | add_task | title: "dentist appointment" |
| "Create a task: review PR #42" | add_task | title: "review PR #42" |

### Task Listing Examples

| User Input | MCP Tool | Parameters |
|------------|----------|------------|
| "Show me all my tasks" | list_tasks | status: "all" |
| "What's on my list?" | list_tasks | status: "all" |
| "What's pending?" | list_tasks | status: "pending" |
| "Show incomplete tasks" | list_tasks | status: "pending" |
| "What have I completed?" | list_tasks | status: "completed" |
| "Show done tasks" | list_tasks | status: "completed" |

### Task Completion Examples

| User Input | MCP Tool | Parameters |
|------------|----------|------------|
| "Mark task 3 as complete" | complete_task | task_id: (from list) |
| "I finished buying groceries" | complete_task | task_id: (matched by title) |
| "Done with the report" | complete_task | task_id: (matched by title) |
| "Check off dentist appointment" | complete_task | task_id: (matched by title) |

### Task Deletion Examples

| User Input | MCP Tool | Parameters |
|------------|----------|------------|
| "Delete task 2" | delete_task | task_id: (from list) |
| "Remove the meeting task" | delete_task | task_id: (matched by title) |
| "I don't need 'call mom' anymore" | delete_task | task_id: (matched by title) |
| "Cancel the dentist appointment" | delete_task | task_id: (matched by title) |

### Task Update Examples

| User Input | MCP Tool | Parameters |
|------------|----------|------------|
| "Change task 1 title to 'urgent report'" | update_task | task_id, title |
| "Rename 'groceries' to 'weekly shopping'" | update_task | task_id, title |
| "Update task 3 description" | update_task | task_id, description |

---

## Chatbot UI Specification

### Design Requirements

The chatbot UI must **exactly match** the existing Taskora frontend theme:

| Property | Value | Reference |
|----------|-------|-----------|
| Background | Existing app background | globals.css |
| Primary Color | Existing primary blue | tailwind.config.ts |
| Accent Color | Existing accent color | tailwind.config.ts |
| Font Family | Existing font stack | tailwind.config.ts |
| Border Radius | Existing border radius | tailwind.config.ts |
| Spacing | Existing spacing scale | tailwind.config.ts |

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Chat Container                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │               Message List (scrollable)           │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ [User Message]                      ──────► │  │  │
│  │  │                              Right aligned  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ ◄────── [Assistant Message]                │  │  │
│  │  │ Left aligned                               │  │  │
│  │  │ [Tool action indicator if applicable]      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                      ...                          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Input Box                    ] [Send] [Loading]  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### UI Components

#### Message Bubble - User
- Position: Right-aligned
- Background: Primary color (or lighter variant)
- Text color: White or dark contrast
- Border radius: Rounded (match existing cards)
- Max width: 70% of container

#### Message Bubble - Assistant
- Position: Left-aligned
- Background: Gray/neutral (match existing theme)
- Text color: Primary text color
- Border radius: Rounded (match existing cards)
- Max width: 70% of container

#### Tool Action Indicator
- Display below assistant message when tool was used
- Subtle styling (small text, muted color)
- Example: "✓ Added task: Buy groceries"

#### Input Area
- Full-width input box
- Placeholder: "Type a message..."
- Send button with icon
- Loading indicator during AI processing

#### Loading State
- Typing indicator animation
- Disable input while processing
- Show subtle loading animation

#### Empty State
- Friendly welcome message
- Suggested commands/examples
- Match existing empty state styling

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Full-width chat, smaller message bubbles |
| Tablet (640-1024px) | Sidebar + chat layout |
| Desktop (>1024px) | Sidebar + expanded chat layout |

### Integration Points

- Chat UI accessible from main navigation (sidebar)
- New route: `/dashboard/chat` or similar
- Persistent conversation list in sidebar (optional)
- Maintain authentication state from Phase II

---

## Security Requirements

### Authentication

| Requirement | Implementation |
|-------------|----------------|
| SR-001 | All chat endpoints require valid JWT token |
| SR-002 | JWT validation uses existing Phase II auth system |
| SR-003 | User can only access their own conversations |
| SR-004 | User can only manage their own tasks via chat |

### Authorization

| Requirement | Implementation |
|-------------|----------------|
| SR-005 | MCP tools receive user_id from validated JWT, not user input |
| SR-006 | Conversation ownership verified before message retrieval |
| SR-007 | Task operations verify task belongs to authenticated user |

### Data Protection

| Requirement | Implementation |
|-------------|----------------|
| SR-008 | No sensitive data in Gemini prompts (passwords, tokens) |
| SR-009 | Tool call logs stored without sensitive parameters |
| SR-010 | Conversation history encrypted at rest (Neon default) |

### Input Validation

| Requirement | Implementation |
|-------------|----------------|
| SR-011 | Message content sanitized before storage |
| SR-012 | Max message length enforced (e.g., 2000 characters) |
| SR-013 | Rate limiting on chat endpoint |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description | User Message |
|------|-------------|-------------|--------------|
| AUTH_REQUIRED | 401 | Missing JWT token | "Please log in to continue" |
| AUTH_INVALID | 401 | Invalid/expired JWT | "Your session has expired. Please log in again" |
| FORBIDDEN | 403 | Accessing another user's data | "You don't have access to this resource" |
| CONVERSATION_NOT_FOUND | 404 | Invalid conversation_id | "Conversation not found" |
| MESSAGE_REQUIRED | 400 | Empty message | "Please enter a message" |
| MESSAGE_TOO_LONG | 400 | Message exceeds limit | "Message is too long (max 2000 characters)" |
| AI_ERROR | 500 | Gemini API failure | "I'm having trouble thinking right now. Please try again" |
| TOOL_ERROR | 500 | MCP tool failure | "I couldn't complete that action. Please try again" |
| RATE_LIMITED | 429 | Too many requests | "Please slow down! Try again in a moment" |

### Graceful Degradation

1. **Gemini API Unavailable:**
   - Return friendly error message
   - Log error for monitoring
   - Do not expose technical details

2. **Database Unavailable:**
   - Return service unavailable error
   - Attempt reconnection
   - Log for alerting

3. **MCP Tool Failure:**
   - Return partial response if possible
   - Inform user of specific failure
   - Suggest alternative action

---

## Deliverables

### Directory Structure

```
/evolution-of-todos
├── /frontend
│   ├── /src
│   │   ├── /app
│   │   │   └── /dashboard
│   │   │       └── /chat          # New chat page
│   │   │           └── page.tsx
│   │   ├── /components
│   │   │   └── /chat              # New chat components
│   │   │       ├── ChatContainer.tsx
│   │   │       ├── MessageList.tsx
│   │   │       ├── MessageBubble.tsx
│   │   │       ├── ChatInput.tsx
│   │   │       └── ToolIndicator.tsx
│   │   └── /services
│   │       └── chatApi.ts         # New chat API client
│   └── CLAUDE.md                  # Update with Phase III info
│
├── /backend
│   ├── /src
│   │   ├── /models
│   │   │   ├── conversation.py    # New conversation model
│   │   │   └── message.py         # New message model
│   │   ├── /api
│   │   │   └── chat_router.py     # New chat endpoint
│   │   ├── /services
│   │   │   ├── chat_service.py    # New chat service
│   │   │   └── agent_service.py   # New Gemini agent service
│   │   └── /mcp
│   │       ├── server.py          # MCP server setup
│   │       └── tools.py           # MCP tool definitions
│   ├── /alembic
│   │   └── /versions
│   │       └── xxx_add_chat_tables.py  # New migration
│   └── CLAUDE.md                  # Update with Phase III info
│
├── /specs
│   └── /003-todo-ai-chatbot
│       ├── constitution.md        # This document
│       ├── spec.md                # Feature specification
│       ├── plan.md                # Implementation plan
│       ├── tasks.md               # Task breakdown
│       └── /contracts
│           └── chat-api-contracts.md
│
└── README.md                      # Update with Phase III info
```

### Required Files

| File | Purpose |
|------|---------|
| `constitution.md` | This document - project rules and architecture |
| `spec.md` | Detailed feature specification |
| `plan.md` | Implementation plan and approach |
| `tasks.md` | Ordered task breakdown |
| `chat-api-contracts.md` | API contract documentation |
| Database migration | New tables for conversations/messages |
| Chat UI components | Frontend chat interface |
| Chat API endpoint | Backend chat processing |
| MCP tools | Task management tools |
| Gemini integration | AI agent setup |

---

## Completion Criteria

### Functional Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| CC-001 | User can send natural language messages | Manual testing |
| CC-002 | AI correctly interprets add task commands | Test with 5+ variations |
| CC-003 | AI correctly interprets list task commands | Test with 5+ variations |
| CC-004 | AI correctly interprets complete task commands | Test with 5+ variations |
| CC-005 | AI correctly interprets delete task commands | Test with 5+ variations |
| CC-006 | AI correctly interprets update task commands | Test with 5+ variations |
| CC-007 | Conversation history persists across sessions | Reload page, check history |
| CC-008 | Tasks created via chat appear in Phase II task list | Cross-verify UI |
| CC-009 | Tasks modified via Phase II UI reflect in chat | Cross-verify UI |
| CC-010 | Multi-turn conversations work correctly | Test 10+ message thread |

### Non-Functional Criteria

| ID | Criterion | Target |
|----|-----------|--------|
| CC-011 | Chat response time | < 3 seconds (excluding AI processing) |
| CC-012 | UI matches existing theme | Visual inspection |
| CC-013 | Phase II functionality unaffected | All existing tests pass |
| CC-014 | Mobile responsive | Test on 3 screen sizes |
| CC-015 | Error messages user-friendly | No technical jargon exposed |

### Security Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| CC-016 | Unauthenticated requests rejected | Test without JWT |
| CC-017 | Cross-user data access prevented | Test with different users |
| CC-018 | Rate limiting active | Test rapid requests |

---

## Prohibited Actions

The following actions are **strictly prohibited** during Phase III development:

### Code Modifications

| Prohibition | Reason |
|-------------|--------|
| Modifying existing Phase II API endpoints | Breaks frontend integration |
| Changing database schema of existing tables | Data migration risk |
| Renaming existing files or directories | Import path breaks |
| Refactoring existing Phase II code | Unnecessary risk |
| Changing existing authentication flow | Security risk |

### Architecture Violations

| Prohibition | Reason |
|-------------|--------|
| Direct database access from AI agent | Violates MCP-only rule |
| Storing state in server memory | Violates stateless rule |
| Using OpenAI instead of Gemini | Spec violation |
| Creating new auth system | Redundant, violates extension rule |
| Breaking existing task API | Phase II compatibility |

### UI Violations

| Prohibition | Reason |
|-------------|--------|
| Using different color palette | Visual inconsistency |
| Using different component library | Styling conflicts |
| Creating conflicting layouts | UX confusion |
| Removing existing UI elements | Feature regression |

---

## Appendix A: Gemini API Integration

### Setup

```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",  # Free tier model
    tools=[...],  # MCP tool definitions
    system_instruction=AGENT_SYSTEM_PROMPT
)
```

### Tool Definition Format

```python
add_task_tool = {
    "name": "add_task",
    "description": "Add a new task to the user's todo list",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "The title of the task"
            },
            "description": {
                "type": "string",
                "description": "Optional description of the task"
            }
        },
        "required": ["title"]
    }
}
```

---

## Appendix B: MCP Server Setup

### Server Initialization

```python
from mcp import Server, Tool

server = Server("taskora-mcp")

@server.tool("add_task")
async def add_task(user_id: str, title: str, description: str = None):
    # Implementation
    pass

@server.tool("list_tasks")
async def list_tasks(user_id: str, status: str = "all"):
    # Implementation
    pass

# ... other tools
```

---

## Appendix C: Environment Variables

### New Variables (Phase III)

| Variable | Description | Required |
|----------|-------------|----------|
| GEMINI_API_KEY | Google Gemini API key | Yes |
| MAX_CONVERSATION_HISTORY | Max messages to load (default: 20) | No |
| CHAT_RATE_LIMIT | Requests per minute (default: 30) | No |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-15 | Claude | Initial constitution |

---

*This constitution is the authoritative document for Phase III development. All implementation decisions must align with the principles and rules defined herein.*
