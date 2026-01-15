# Implementation Plan: Todo AI Chatbot

**Branch**: `003-todo-ai-chatbot` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-todo-ai-chatbot/spec.md`

---

## Summary

Build an AI-powered chatbot extension for Taskora that enables natural language task management. Users interact with a conversational interface where the Gemini AI agent interprets intent and executes task operations via MCP tools. The system is completely stateless, persisting all conversation and task data to PostgreSQL. Implementation extends Phase II without breaking existing functionality.

---

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.3+ (Frontend)
**Primary Dependencies**: FastAPI, google-generativeai, SQLModel (Backend); Next.js 16, React 18, Tailwind CSS (Frontend)
**Storage**: Neon Serverless PostgreSQL (existing Phase II instance)
**Testing**: pytest (Backend), manual E2E testing (Frontend)
**Target Platform**: Web application (desktop + mobile responsive)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: < 5 second chat response (excluding AI latency), < 2 second UI load
**Constraints**: Stateless server, MCP-only AI operations, Gemini Free tier limits (15 RPM)
**Scale/Scope**: Single-user sessions, ~20 message context window, 5 MCP tools

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status | Notes |
|------|-------------|--------|-------|
| GR-001 | Do NOT modify Phase II code | PASS | Only adding new files |
| GR-002 | Do NOT rename/refactor existing files | PASS | Extending, not modifying |
| GR-003 | Do NOT touch existing API endpoints | PASS | New /chat endpoint only |
| GR-004 | AI must ONLY use MCP tools | PASS | Tool-based architecture |
| GR-005 | Server must be stateless | PASS | DB-only persistence |
| GR-006 | All data persists to PostgreSQL | PASS | conversations + messages tables |
| GR-007 | Chat UI must match existing theme | PASS | Using existing Tailwind config |
| GR-008 | Use Gemini Free model | PASS | gemini-1.5-flash selected |

**Constitution Compliance**: All 8 golden rules satisfied.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-todo-ai-chatbot/
├── constitution.md      # Project rules and architecture
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research findings
├── data-model.md        # Database schema design
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── chat-api-contracts.md  # API endpoint specifications
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py          # Update: add new model exports
│   │   ├── user.py              # EXISTING - DO NOT MODIFY
│   │   ├── task.py              # EXISTING - DO NOT MODIFY
│   │   ├── conversation.py      # NEW: Conversation model
│   │   └── message.py           # NEW: Message model
│   ├── api/
│   │   ├── __init__.py          # Update: add chat router
│   │   ├── auth_router.py       # EXISTING - DO NOT MODIFY
│   │   ├── task_router.py       # EXISTING - DO NOT MODIFY
│   │   └── chat_router.py       # NEW: Chat endpoints
│   ├── services/
│   │   ├── auth_service.py      # EXISTING - DO NOT MODIFY
│   │   ├── task_service.py      # EXISTING - DO NOT MODIFY
│   │   ├── chat_service.py      # NEW: Chat business logic
│   │   └── agent_service.py     # NEW: Gemini AI integration
│   ├── mcp/
│   │   ├── __init__.py          # NEW: MCP module init
│   │   └── tools.py             # NEW: MCP tool definitions
│   └── main.py                  # Update: register chat router
├── alembic/
│   └── versions/
│       └── xxx_add_chat_tables.py  # NEW: Migration script
├── tests/
│   └── test_chat.py             # NEW: Chat endpoint tests
└── requirements.txt             # Update: add google-generativeai

frontend/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       ├── page.tsx         # EXISTING - DO NOT MODIFY
│   │       └── chat/
│   │           └── page.tsx     # NEW: Chat page
│   ├── components/
│   │   ├── Sidebar.tsx          # Update: add chat nav link
│   │   ├── TaskCard.tsx         # EXISTING - DO NOT MODIFY
│   │   ├── TaskList.tsx         # EXISTING - DO NOT MODIFY
│   │   └── chat/
│   │       ├── ChatContainer.tsx   # NEW: Main chat wrapper
│   │       ├── MessageList.tsx     # NEW: Message display
│   │       ├── MessageBubble.tsx   # NEW: Individual message
│   │       ├── ChatInput.tsx       # NEW: Input field
│   │       └── ToolIndicator.tsx   # NEW: Tool usage display
│   └── services/
│       ├── api.ts               # EXISTING - DO NOT MODIFY
│       └── chatApi.ts           # NEW: Chat API client
└── package.json                 # No changes needed
```

**Structure Decision**: Web application structure with separate frontend and backend directories, extending existing Phase II codebase. New files added to existing module structure; no directory restructuring.

---

## Complexity Tracking

No violations detected. All implementation choices align with constitution requirements.

| Aspect | Decision | Simpler Alternative | Why Not Simpler |
|--------|----------|---------------------|-----------------|
| AI Framework | Gemini SDK | Direct API calls | SDK provides retries, error handling |
| MCP Tools | Native functions | Full MCP server | Overkill for 5 tools in same process |
| State Management | PostgreSQL only | Redis cache | Unnecessary complexity, DB sufficient |

---

## Implementation Phases

### Phase 0: Research (Complete)

- [x] Gemini AI integration approach
- [x] MCP tool implementation strategy
- [x] Stateless conversation handling
- [x] JWT authentication reuse
- [x] Chat UI component design
- [x] Database schema extension
- [x] Error handling strategy
- [x] Performance optimization approach

See [research.md](./research.md) for detailed findings.

### Phase 1: Design (Complete)

- [x] Database schema design
- [x] API contract specification
- [x] MCP tool schemas
- [x] Quickstart guide

**Artifacts Generated**:
- [data-model.md](./data-model.md)
- [contracts/chat-api-contracts.md](./contracts/chat-api-contracts.md)
- [quickstart.md](./quickstart.md)

### Phase 2: Implementation (Pending)

To be generated via `/sp.tasks` command.

**High-Level Task Groups**:

1. **Backend Infrastructure**
   - Database migration (conversations, messages tables)
   - SQLModel entities
   - Module initialization

2. **MCP Tools**
   - add_task tool
   - list_tasks tool
   - complete_task tool
   - delete_task tool
   - update_task tool

3. **AI Agent Service**
   - Gemini SDK integration
   - Tool calling logic
   - Response generation

4. **Chat Service**
   - Conversation management
   - Message persistence
   - Context building

5. **API Endpoints**
   - POST /api/{user_id}/chat
   - GET /api/{user_id}/conversations
   - GET /api/{user_id}/conversations/{id}/messages
   - DELETE /api/{user_id}/conversations/{id}

6. **Frontend Components**
   - ChatContainer
   - MessageList
   - MessageBubble
   - ChatInput
   - ToolIndicator

7. **Chat Page**
   - Route setup
   - State management
   - API integration

8. **Navigation**
   - Sidebar chat link

9. **Testing & Polish**
   - E2E testing
   - Error handling
   - UI/UX refinement

---

## Dependencies

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Gemini API | AI processing | API key required |
| Neon PostgreSQL | Data storage | Existing (Phase II) |

### Internal Dependencies

| Dependency | Required By | Status |
|------------|-------------|--------|
| Phase II Auth | Chat endpoints | Existing |
| Phase II Tasks | MCP tools | Existing |
| Phase II UI | Chat components | Existing |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Gemini rate limits | Implement backoff, user-friendly errors |
| AI response quality | Iterative prompt refinement |
| Context window limits | Truncate oldest messages |
| Phase II breakage | No modifications to existing code |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task creation success | 95% | Manual testing |
| Response time | < 5s | Timing measurement |
| UI load time | < 2s | Browser dev tools |
| Phase II regression | 0 issues | Existing test suite |

---

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Execute tasks in dependency order
3. Verify against completion criteria
4. Deploy and monitor

---

## Document References

| Document | Purpose |
|----------|---------|
| [constitution.md](./constitution.md) | Golden rules and architecture |
| [spec.md](./spec.md) | Feature requirements |
| [research.md](./research.md) | Technical decisions |
| [data-model.md](./data-model.md) | Database schema |
| [chat-api-contracts.md](./contracts/chat-api-contracts.md) | API specifications |
| [quickstart.md](./quickstart.md) | Developer setup |
