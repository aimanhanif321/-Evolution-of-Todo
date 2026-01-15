# Research Document: Todo AI Chatbot

**Feature**: 003-todo-ai-chatbot
**Date**: 2026-01-15
**Status**: Complete

---

## Research Tasks

### 1. Gemini AI Integration with FastAPI

**Question**: How to integrate Google Gemini Free model with FastAPI for function calling?

**Decision**: Use `google-generativeai` SDK with function calling (tools) feature

**Rationale**:
- Official Google SDK with native Python support
- Built-in function calling capability matches MCP tool pattern
- Free tier (`gemini-1.5-flash`) supports 15 RPM, 1M TPM - sufficient for development
- Async support compatible with FastAPI

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| LangChain | Adds unnecessary abstraction layer, increases complexity |
| Direct REST API | More boilerplate, SDK handles retries/errors better |
| Vertex AI | Requires GCP account, not free tier |

**Implementation Notes**:
```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    tools=[add_task_tool, list_tasks_tool, ...],
    system_instruction="You are Taskora AI..."
)

# Async chat
chat = model.start_chat()
response = await chat.send_message_async(user_message)
```

---

### 2. MCP (Model Context Protocol) Implementation

**Question**: How to implement MCP tools in a FastAPI stateless architecture?

**Decision**: Implement MCP tools as simple Python functions called by Gemini

**Rationale**:
- MCP SDK adds complexity without benefit in this stateless context
- Gemini's native function calling achieves same result
- Direct function calls are simpler to test and debug
- No need for separate MCP server process

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Full MCP Server | Overkill for 5 tools, adds IPC complexity |
| OpenAI Agents SDK | Spec requires Gemini, not OpenAI |
| Custom tool router | Gemini SDK already provides this |

**Implementation Notes**:
- Define tools as Pydantic models for Gemini
- Map tool names to handler functions
- Execute handlers with validated parameters
- Return results for AI to process

---

### 3. Stateless Conversation Management

**Question**: How to maintain conversation context without server state?

**Decision**: Store all messages in PostgreSQL, fetch N most recent on each request

**Rationale**:
- Aligns with constitution requirement (CP-003, CP-004)
- PostgreSQL already available from Phase II
- Simple query to fetch recent messages
- No new infrastructure needed

**Configuration**:
- Default context window: 20 messages
- Configurable via `MAX_CONVERSATION_HISTORY` env var
- Oldest messages dropped when limit exceeded

**Implementation Notes**:
```python
async def get_conversation_context(conversation_id: UUID, limit: int = 20):
    messages = await db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    return list(reversed(messages))  # Chronological order
```

---

### 4. JWT Authentication Integration

**Question**: How to integrate chat endpoints with existing Phase II auth?

**Decision**: Reuse existing `get_current_user` dependency from Phase II

**Rationale**:
- Existing auth system works and is tested
- Golden rule GR-003 prohibits modifying existing endpoints
- Same JWT validation logic ensures consistency

**Implementation Notes**:
```python
from src.dependencies.auth_dependencies import get_current_user

@router.post("/api/{user_id}/chat")
async def chat(
    user_id: UUID,
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403)
    # Process chat...
```

---

### 5. Chat UI Implementation

**Question**: How to build chat UI matching Phase II theme?

**Decision**: Custom React components using existing Tailwind configuration

**Rationale**:
- Golden rule GR-007 requires matching existing theme
- No new dependencies needed (FR-100 in constitution)
- Full control over styling and behavior

**Key Components**:
| Component | Purpose |
|-----------|---------|
| ChatContainer | Main wrapper, handles layout |
| MessageList | Scrollable message display |
| MessageBubble | Individual message styling |
| ChatInput | Text input + send button |
| ToolIndicator | Shows MCP tool usage |

**Theme Reference Points**:
- `frontend/tailwind.config.ts` - colors, spacing, fonts
- `frontend/src/globals.css` - base styles
- `frontend/src/components/TaskCard.tsx` - card styling reference

---

### 6. Database Schema Extension

**Question**: How to add conversation tables without affecting existing schema?

**Decision**: New migration adding `conversations` and `messages` tables only

**Rationale**:
- Golden rule GR-002 prohibits modifying existing tables
- New tables have foreign keys to existing `users` table
- Alembic migration ensures version control

**Migration Strategy**:
1. Create new Alembic migration file
2. Add `conversations` table with user_id FK
3. Add `messages` table with conversation_id FK
4. Add indexes for query optimization
5. No changes to `users` or `tasks` tables

---

### 7. Error Handling Strategy

**Question**: How to handle Gemini API errors gracefully?

**Decision**: Wrap all AI calls in try/catch with user-friendly fallbacks

**Rationale**:
- FR-011 requires graceful error handling
- Users should never see technical errors
- Logging captures details for debugging

**Error Mapping**:
| Error Type | User Message |
|------------|--------------|
| API timeout | "I'm thinking... please wait a moment" |
| Rate limit | "Please slow down! Try again in a moment" |
| Invalid response | "I didn't understand that. Could you rephrase?" |
| Tool failure | "I couldn't complete that action. Please try again" |

---

### 8. Performance Considerations

**Question**: How to ensure chat responses are fast enough?

**Decision**: Optimize database queries, use connection pooling, async everywhere

**Rationale**:
- SC-002 requires < 5 second response (excluding AI)
- SC-004 requires < 2 second UI load
- Neon already supports connection pooling

**Optimizations**:
- Index on `messages.conversation_id` for fast lookup
- Index on `conversations.user_id` for user queries
- Async database operations with SQLAlchemy
- Async Gemini API calls
- Frontend optimistic UI updates

---

## Technology Decisions Summary

| Component | Decision | Rationale |
|-----------|----------|-----------|
| AI Model | Gemini 1.5 Flash | Free tier, function calling support |
| AI SDK | google-generativeai | Official, async support |
| MCP Implementation | Native Gemini tools | Simpler than full MCP server |
| Auth | Existing Phase II JWT | Reuse, don't rebuild |
| Database | PostgreSQL (Neon) | Existing, no new infra |
| ORM | SQLModel | Existing, compatible |
| Frontend | React + Tailwind | Existing stack |
| Chat UI | Custom components | Theme consistency |

---

## Dependencies to Add

### Backend (requirements.txt)
```
google-generativeai>=0.3.0
```

### Frontend (package.json)
```
No new dependencies required
```

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| GEMINI_API_KEY | Google AI API key | - | Yes |
| MAX_CONVERSATION_HISTORY | Messages to load | 20 | No |
| CHAT_RATE_LIMIT | Requests per minute | 30 | No |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini rate limits | Medium | High | Implement backoff, show friendly error |
| Slow AI response | Medium | Medium | Show loading state, timeout handling |
| Tool execution failure | Low | Medium | Graceful error messages, retry option |
| DB connection issues | Low | High | Connection pooling, health checks |

---

## Resolved Clarifications

All technical unknowns have been resolved through this research. No NEEDS CLARIFICATION items remain.
