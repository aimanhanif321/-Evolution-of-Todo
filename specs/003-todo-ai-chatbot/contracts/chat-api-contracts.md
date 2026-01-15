# Chat API Contracts

**Feature**: 003-todo-ai-chatbot
**Date**: 2026-01-15
**Base URL**: `/api`

---

## Authentication

All endpoints require JWT Bearer token authentication.

**Header**: `Authorization: Bearer <jwt_token>`

**Error Response (401 Unauthorized)**:
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Please log in to continue"
  }
}
```

---

## Endpoints

### 1. Send Chat Message

Send a natural language message to the AI assistant.

**Endpoint**: `POST /api/{user_id}/chat`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's ID |

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Add a task to buy groceries"
}
```

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| conversation_id | UUID | No | Valid UUID | Existing conversation. If omitted, creates new |
| message | string | Yes | 1-2000 chars | User's natural language message |

**Success Response (200 OK)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Done! I've added 'buy groceries' to your task list.",
  "tool_calls": [
    {
      "tool": "add_task",
      "params": {
        "title": "buy groceries",
        "description": null
      },
      "result": {
        "task_id": "661f9500-f39c-52e5-b827-557766551111",
        "status": "created",
        "title": "buy groceries"
      }
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| conversation_id | UUID | The conversation ID (new or existing) |
| response | string | AI-generated natural language response |
| tool_calls | array | List of MCP tools invoked (may be empty) |

**Error Responses**:

| Status | Code | Condition | Response |
|--------|------|-----------|----------|
| 400 | MESSAGE_REQUIRED | Empty or missing message | `{"error": {"code": "MESSAGE_REQUIRED", "message": "Please enter a message"}}` |
| 400 | MESSAGE_TOO_LONG | Message > 2000 chars | `{"error": {"code": "MESSAGE_TOO_LONG", "message": "Message is too long (max 2000 characters)"}}` |
| 401 | AUTH_REQUIRED | Missing JWT | `{"error": {"code": "AUTH_REQUIRED", "message": "Please log in to continue"}}` |
| 401 | AUTH_INVALID | Invalid/expired JWT | `{"error": {"code": "AUTH_INVALID", "message": "Your session has expired. Please log in again"}}` |
| 403 | FORBIDDEN | user_id mismatch | `{"error": {"code": "FORBIDDEN", "message": "You don't have access to this resource"}}` |
| 404 | CONVERSATION_NOT_FOUND | Invalid conversation_id | `{"error": {"code": "CONVERSATION_NOT_FOUND", "message": "Conversation not found"}}` |
| 429 | RATE_LIMITED | Too many requests | `{"error": {"code": "RATE_LIMITED", "message": "Please slow down! Try again in a moment"}}` |
| 500 | AI_ERROR | Gemini API failure | `{"error": {"code": "AI_ERROR", "message": "I'm having trouble thinking right now. Please try again"}}` |
| 500 | TOOL_ERROR | MCP tool failure | `{"error": {"code": "TOOL_ERROR", "message": "I couldn't complete that action. Please try again"}}` |

---

### 2. List Conversations

Get all conversations for the authenticated user.

**Endpoint**: `GET /api/{user_id}/conversations`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's ID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 20 | Max conversations to return (1-100) |
| offset | int | 0 | Pagination offset |

**Success Response (200 OK)**:
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T11:45:00Z",
      "message_count": 12,
      "last_message": "I finished buying groceries"
    },
    {
      "id": "661f9500-f39c-52e5-b827-557766551111",
      "created_at": "2026-01-14T09:00:00Z",
      "updated_at": "2026-01-14T09:15:00Z",
      "message_count": 4,
      "last_message": "Show my tasks"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 401 | AUTH_REQUIRED | Missing JWT |
| 403 | FORBIDDEN | user_id mismatch |

---

### 3. Get Conversation Messages

Get all messages in a specific conversation.

**Endpoint**: `GET /api/{user_id}/conversations/{conversation_id}/messages`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's ID |
| conversation_id | UUID | Yes | Target conversation ID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 50 | Max messages to return (1-100) |
| before | UUID | null | Get messages before this message ID |

**Success Response (200 OK)**:
```json
{
  "messages": [
    {
      "id": "aaa11111-1111-1111-1111-111111111111",
      "role": "user",
      "content": "Add a task to buy groceries",
      "tool_calls": null,
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "bbb22222-2222-2222-2222-222222222222",
      "role": "assistant",
      "content": "Done! I've added 'buy groceries' to your task list.",
      "tool_calls": [
        {
          "tool": "add_task",
          "params": {"title": "buy groceries"},
          "result": {"task_id": "...", "status": "created", "title": "buy groceries"}
        }
      ],
      "created_at": "2026-01-15T10:30:01Z"
    }
  ],
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "has_more": false
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 401 | AUTH_REQUIRED | Missing JWT |
| 403 | FORBIDDEN | user_id mismatch or conversation belongs to different user |
| 404 | CONVERSATION_NOT_FOUND | Invalid conversation_id |

---

### 4. Delete Conversation

Delete a conversation and all its messages.

**Endpoint**: `DELETE /api/{user_id}/conversations/{conversation_id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's ID |
| conversation_id | UUID | Yes | Target conversation ID |

**Success Response (200 OK)**:
```json
{
  "deleted": true,
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "messages_deleted": 12
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 401 | AUTH_REQUIRED | Missing JWT |
| 403 | FORBIDDEN | user_id mismatch |
| 404 | CONVERSATION_NOT_FOUND | Invalid conversation_id |

---

## MCP Tool Schemas

### add_task

```json
{
  "name": "add_task",
  "description": "Add a new task to the user's todo list",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the task",
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "Optional description of the task",
        "maxLength": 1000
      }
    },
    "required": ["title"]
  }
}
```

**Response**:
```json
{
  "task_id": "uuid",
  "status": "created",
  "title": "Task title"
}
```

---

### list_tasks

```json
{
  "name": "list_tasks",
  "description": "List the user's tasks with optional filtering",
  "parameters": {
    "type": "object",
    "properties": {
      "status": {
        "type": "string",
        "enum": ["all", "pending", "completed"],
        "description": "Filter tasks by status",
        "default": "all"
      }
    },
    "required": []
  }
}
```

**Response**:
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

---

### complete_task

```json
{
  "name": "complete_task",
  "description": "Mark a task as completed",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "The ID of the task to complete"
      }
    },
    "required": ["task_id"]
  }
}
```

**Response**:
```json
{
  "task_id": "uuid",
  "status": "completed",
  "title": "Task title"
}
```

---

### delete_task

```json
{
  "name": "delete_task",
  "description": "Delete a task from the user's list",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "The ID of the task to delete"
      }
    },
    "required": ["task_id"]
  }
}
```

**Response**:
```json
{
  "task_id": "uuid",
  "status": "deleted",
  "title": "Task title"
}
```

---

### update_task

```json
{
  "name": "update_task",
  "description": "Update a task's title or description",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "The ID of the task to update"
      },
      "title": {
        "type": "string",
        "description": "New title for the task",
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "New description for the task",
        "maxLength": 1000
      }
    },
    "required": ["task_id"]
  }
}
```

**Response**:
```json
{
  "task_id": "uuid",
  "status": "updated",
  "title": "Updated title"
}
```

---

## Pydantic Schemas

### Request Schemas

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID

class ChatRequest(BaseModel):
    """Request body for POST /api/{user_id}/chat"""
    conversation_id: Optional[UUID] = None
    message: str = Field(..., min_length=1, max_length=2000)

    @field_validator('message')
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()
```

### Response Schemas

```python
from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class ToolCallResult(BaseModel):
    """Single tool call in a chat response"""
    tool: str
    params: dict[str, Any]
    result: Optional[dict[str, Any]] = None

class ChatResponse(BaseModel):
    """Response body for POST /api/{user_id}/chat"""
    conversation_id: UUID
    response: str
    tool_calls: List[ToolCallResult] = []

class ConversationSummary(BaseModel):
    """Summary of a conversation for listing"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: Optional[str] = None

class ConversationListResponse(BaseModel):
    """Response body for GET /api/{user_id}/conversations"""
    conversations: List[ConversationSummary]
    total: int
    limit: int
    offset: int

class MessageResponse(BaseModel):
    """Single message in conversation history"""
    id: UUID
    role: str
    content: str
    tool_calls: Optional[List[ToolCallResult]] = None
    created_at: datetime

class MessagesListResponse(BaseModel):
    """Response body for GET /api/{user_id}/conversations/{id}/messages"""
    messages: List[MessageResponse]
    conversation_id: UUID
    has_more: bool

class DeleteConversationResponse(BaseModel):
    """Response body for DELETE conversation"""
    deleted: bool
    conversation_id: UUID
    messages_deleted: int

class ErrorDetail(BaseModel):
    """Error response detail"""
    code: str
    message: str
    details: Optional[dict] = None

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: ErrorDetail
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/{user_id}/chat | 30 | 1 minute |
| GET /api/{user_id}/conversations | 60 | 1 minute |
| GET .../messages | 60 | 1 minute |
| DELETE .../conversations | 10 | 1 minute |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1705320600
```

---

## WebSocket (Future Enhancement)

> Note: Initial implementation uses REST. WebSocket may be added for real-time streaming.

**Potential Endpoint**: `WS /api/{user_id}/chat/stream`

**Message Format**:
```json
{
  "type": "message" | "tool_call" | "error" | "done",
  "data": { ... }
}
```
