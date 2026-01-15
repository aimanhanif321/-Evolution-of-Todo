# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/003-todo-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api-contracts.md

**Tests**: Tests are OPTIONAL for this implementation. Manual E2E testing will be used per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- Per plan.md project structure

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Add new dependencies and prepare project structure for Phase III

- [x] T001 Add `google-generativeai>=0.3.0` to backend/requirements.txt
- [x] T002 [P] Add GEMINI_API_KEY to backend/.env.example with placeholder
- [x] T003 [P] Create backend/src/mcp/ directory structure
- [x] T004 [P] Create backend/src/mcp/__init__.py with module docstring
- [x] T005 [P] Create frontend/src/components/chat/ directory structure
- [x] T006 [P] Create frontend/src/app/dashboard/chat/ directory structure
- [x] T007 Install new backend dependencies by running `pip install -r requirements.txt` in backend/

**Checkpoint**: Project structure ready for Phase III development - COMPLETED 2026-01-15

---


## Phase 2: Foundational (Database & Core Models)

**Purpose**: Database migration and core models that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Database Migration

- [x] T008 Create Alembic migration file backend/alembic/versions/add_chat_tables.py with conversations and messages tables per data-model.md
- [x] T009 Add UUID extension check `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` to migration
- [x] T010 Add conversations table with id (UUID PK), user_id (FK to users.id), created_at, updated_at columns
- [x] T011 Add idx_conversations_user_id index on conversations(user_id)
- [x] T012 Add idx_conversations_updated_at index on conversations(updated_at DESC)
- [x] T013 Add messages table with id (UUID PK), conversation_id (FK), user_id (FK), role, content, tool_calls (JSONB), created_at
- [x] T014 Add CHECK constraint on messages.role IN ('user', 'assistant')
- [x] T015 Add idx_messages_conversation_id index on messages(conversation_id)
- [x] T016 Add idx_messages_user_id index on messages(user_id)
- [x] T017 Add idx_messages_created_at index on messages(created_at)
- [x] T018 Add downgrade function to drop messages then conversations tables
- [ ] T019 Run `alembic upgrade head` to apply migration (REQUIRES MANUAL EXECUTION)

### SQLModel Entities

- [x] T020 [P] Create ConversationBase class in backend/src/models/conversation.py
- [x] T021 [P] Create Conversation table model with id, user_id, created_at, updated_at, messages relationship in backend/src/models/conversation.py
- [x] T022 [P] Create ConversationCreate schema in backend/src/models/conversation.py
- [x] T023 [P] Create ConversationRead schema with optional message_count in backend/src/models/conversation.py
- [x] T024 [P] Create MessageBase class with role, content fields and role validator in backend/src/models/message.py
- [x] T025 [P] Create Message table model with all fields and conversation relationship in backend/src/models/message.py
- [x] T026 [P] Add get_tool_calls() and set_tool_calls() helper methods to Message model in backend/src/models/message.py
- [x] T027 [P] Create MessageCreate schema in backend/src/models/message.py
- [x] T028 [P] Create MessageRead schema in backend/src/models/message.py
- [x] T029 Export Conversation, Message models from backend/src/models/__init__.py

### Pydantic Schemas for API

- [x] T030 [P] Create ChatRequest schema with conversation_id (optional UUID), message (str 1-2000 chars) in backend/src/api/schemas/chat_schemas.py
- [x] T031 [P] Create ToolCallResult schema with tool, params, result fields in backend/src/api/schemas/chat_schemas.py
- [x] T032 [P] Create ChatResponse schema with conversation_id, response, tool_calls in backend/src/api/schemas/chat_schemas.py
- [x] T033 [P] Create ConversationSummary schema with id, created_at, updated_at, message_count, last_message in backend/src/api/schemas/chat_schemas.py
- [x] T034 [P] Create ConversationListResponse schema with conversations list, total, limit, offset in backend/src/api/schemas/chat_schemas.py
- [x] T035 [P] Create MessageResponse schema with id, role, content, tool_calls, created_at in backend/src/api/schemas/chat_schemas.py
- [x] T036 [P] Create MessagesListResponse schema with messages, conversation_id, has_more in backend/src/api/schemas/chat_schemas.py
- [x] T037 [P] Create DeleteConversationResponse schema in backend/src/api/schemas/chat_schemas.py
- [x] T038 [P] Create ErrorDetail and ErrorResponse schemas in backend/src/api/schemas/chat_schemas.py

### MCP Tools Infrastructure

- [x] T039 Create tool schema definitions dict for add_task in backend/src/mcp/tools.py per contracts
- [x] T040 Create tool schema definitions dict for list_tasks in backend/src/mcp/tools.py per contracts
- [x] T041 Create tool schema definitions dict for complete_task in backend/src/mcp/tools.py per contracts
- [x] T042 Create tool schema definitions dict for delete_task in backend/src/mcp/tools.py per contracts
- [x] T043 Create tool schema definitions dict for update_task in backend/src/mcp/tools.py per contracts
- [x] T044 Create TOOLS list combining all 5 tool schemas in backend/src/mcp/tools.py
- [x] T045 Create async add_task_handler(user_id, title, description=None) function in backend/src/mcp/tools.py
- [x] T046 Create async list_tasks_handler(user_id, status="all") function in backend/src/mcp/tools.py
- [x] T047 Create async complete_task_handler(user_id, task_id) function in backend/src/mcp/tools.py
- [x] T048 Create async delete_task_handler(user_id, task_id) function in backend/src/mcp/tools.py
- [x] T049 Create async update_task_handler(user_id, task_id, title=None, description=None) function in backend/src/mcp/tools.py
- [x] T050 Create TOOL_HANDLERS dict mapping tool names to handler functions in backend/src/mcp/tools.py
- [x] T051 Create async execute_tool(tool_name, user_id, params) dispatcher function in backend/src/mcp/tools.py
- [x] T052 Export TOOLS, TOOL_HANDLERS, execute_tool from backend/src/mcp/__init__.py

### Agent Service (Gemini Integration)

- [x] T053 Import google.generativeai as genai in backend/src/services/agent_service.py
- [x] T054 Create configure_gemini() function to set API key from env in backend/src/services/agent_service.py
- [x] T055 Define SYSTEM_PROMPT constant with Taskora AI instructions per constitution in backend/src/services/agent_service.py
- [x] T056 Create get_gemini_model() function returning GenerativeModel with tools and system_instruction in backend/src/services/agent_service.py
- [x] T057 Create build_message_history(messages: list) function to format messages for Gemini in backend/src/services/agent_service.py
- [x] T058 Create async process_tool_calls(response, user_id) function to execute tool calls from Gemini in backend/src/services/agent_service.py
- [x] T059 Create async generate_response(user_id, messages, user_message) main agent function in backend/src/services/agent_service.py
- [x] T060 Add try/except error handling with user-friendly fallback messages in backend/src/services/agent_service.py
- [x] T061 Add logging for agent operations in backend/src/services/agent_service.py

### Chat Service (Business Logic)

- [x] T062 Create async get_or_create_conversation(user_id, conversation_id=None) in backend/src/services/chat_service.py
- [x] T063 Create async get_conversation_messages(conversation_id, limit=20) in backend/src/services/chat_service.py
- [x] T064 Create async store_user_message(conversation_id, user_id, content) in backend/src/services/chat_service.py
- [x] T065 Create async store_assistant_message(conversation_id, user_id, content, tool_calls=None) in backend/src/services/chat_service.py
- [x] T066 Create async update_conversation_timestamp(conversation_id) in backend/src/services/chat_service.py
- [x] T067 Create async process_chat_message(user_id, conversation_id, message) orchestrator function in backend/src/services/chat_service.py
- [x] T068 Create async get_user_conversations(user_id, limit=20, offset=0) in backend/src/services/chat_service.py
- [x] T069 Create async get_conversation_with_messages(user_id, conversation_id, limit=50) in backend/src/services/chat_service.py
- [x] T070 Create async delete_conversation(user_id, conversation_id) in backend/src/services/chat_service.py
- [x] T071 Add validation that user owns conversation before operations in backend/src/services/chat_service.py

**Checkpoint**: Foundation complete - User story implementation can now begin - COMPLETED 2026-01-16

---

## Phase 3: User Story 1 & 2 - Task Creation + Listing (Priority: P1)

**Goal**: Enable users to add and view tasks via natural language chat - the core MVP functionality

**Independent Test**: Send "Add a task to buy groceries" and verify task is created. Send "Show my tasks" and verify list is returned.

### Backend API Endpoints (US1+US2)

- [x] T072 Create chat_router with APIRouter in backend/src/api/chat_router.py
- [x] T073 [US1] Implement POST /api/{user_id}/chat endpoint with JWT auth dependency in backend/src/api/chat_router.py
- [x] T074 [US1] Add user_id validation against JWT token in POST /api/{user_id}/chat
- [x] T075 [US1] Add message validation (1-2000 chars, not empty) in POST /api/{user_id}/chat
- [x] T076 [US1] Call chat_service.process_chat_message and return ChatResponse in POST /api/{user_id}/chat
- [x] T077 [US1] Add error handling for MESSAGE_REQUIRED, MESSAGE_TOO_LONG, FORBIDDEN errors
- [x] T078 [US1] Add error handling for AI_ERROR, TOOL_ERROR with user-friendly messages
- [x] T079 [US2] Implement GET /api/{user_id}/conversations endpoint in backend/src/api/chat_router.py
- [x] T080 [US2] Add limit/offset query parameters for pagination in GET /api/{user_id}/conversations
- [x] T081 [US2] Implement GET /api/{user_id}/conversations/{conversation_id}/messages endpoint in backend/src/api/chat_router.py
- [x] T082 Register chat_router in backend/src/api/__init__.py
- [x] T083 Include chat_router in backend/src/main.py with prefix="/api" and tags=["Chat"]

### Frontend Chat API Client (US1+US2)

- [x] T084 [P] [US1] Create chatApi.ts in frontend/src/services/chatApi.ts
- [x] T085 [P] [US1] Implement sendMessage(userId, message, conversationId?) function in chatApi.ts
- [x] T086 [P] [US2] Implement getConversations(userId, limit?, offset?) function in chatApi.ts
- [x] T087 [P] [US2] Implement getMessages(userId, conversationId, limit?) function in chatApi.ts
- [x] T088 [P] [US1] Add JWT token header to all chat API requests in chatApi.ts
- [x] T089 [P] [US1] Add error handling and response typing in chatApi.ts

### Frontend Chat Components (US1+US2)

- [x] T090 [P] [US1] Create MessageBubble component with role-based styling (user right, assistant left) in frontend/src/components/chat/MessageBubble.tsx
- [x] T091 [P] [US1] Add message content display with timestamp in MessageBubble.tsx
- [x] T092 [P] [US1] Create ToolIndicator component showing tool action status in frontend/src/components/chat/ToolIndicator.tsx
- [x] T093 [P] [US1] Style ToolIndicator with subtle checkmark and tool description
- [x] T094 [P] [US2] Create MessageList component with scrollable container in frontend/src/components/chat/MessageList.tsx
- [x] T095 [P] [US2] Add auto-scroll to bottom on new messages in MessageList.tsx
- [x] T096 [P] [US2] Map messages to MessageBubble components with ToolIndicator for assistant messages
- [x] T097 [P] [US1] Create ChatInput component with text input and send button in frontend/src/components/chat/ChatInput.tsx
- [x] T098 [P] [US1] Add loading state disable during message processing in ChatInput.tsx
- [x] T099 [P] [US1] Add Enter key submit handling in ChatInput.tsx
- [x] T100 [P] [US1] Add max length validation (2000 chars) with visual indicator in ChatInput.tsx
- [x] T101 [US1] Create ChatContainer component wrapping MessageList and ChatInput in frontend/src/components/chat/ChatContainer.tsx
- [x] T102 [US1] Add loading indicator (typing animation) while AI processes in ChatContainer.tsx
- [x] T103 [US1] Manage messages state and sendMessage handler in ChatContainer.tsx
- [x] T104 [US2] Add conversation loading on mount in ChatContainer.tsx
- [x] T105 [US1] Add empty state welcome message in ChatContainer.tsx

### Frontend Chat Page (US1+US2)

- [x] T106 [US1] Create chat page.tsx in frontend/src/app/dashboard/chat/page.tsx
- [x] T107 [US1] Import and render ChatContainer in chat page.tsx
- [x] T108 [US1] Add authentication check redirect to login if not authenticated
- [x] T109 [US1] Get user_id from auth context in chat page.tsx
- [x] T110 [US1] Style page to match existing dashboard layout

### Navigation Update (US1+US2)

- [x] T111 [US1] Add "Chat" navigation link to Sidebar component in frontend/src/components/Sidebar.tsx
- [x] T112 [US1] Use chat/message icon for Chat nav item
- [x] T113 [US1] Add active state styling for /dashboard/chat route

**Checkpoint**: US1+US2 complete - Users can create tasks and list tasks via chat. This is the MVP. - COMPLETED 2026-01-16

---

## Phase 4: User Story 3 - Task Completion (Priority: P2)

**Goal**: Enable users to mark tasks as complete via natural language

**Independent Test**: Create a task, then say "Mark it as done" and verify task status changes to completed.

### MCP Tool Enhancement (US3)

- [ ] T114 [US3] Verify complete_task_handler queries existing task by task_id in backend/src/mcp/tools.py
- [ ] T115 [US3] Verify complete_task_handler checks task belongs to user_id in backend/src/mcp/tools.py
- [ ] T116 [US3] Verify complete_task_handler sets task.completed = True and updates updated_at
- [ ] T117 [US3] Add error handling for task not found in complete_task_handler
- [ ] T118 [US3] Add error handling for task already completed in complete_task_handler

### Agent Prompt Enhancement (US3)

- [ ] T119 [US3] Update SYSTEM_PROMPT to handle completion phrases in backend/src/services/agent_service.py
- [ ] T120 [US3] Add instruction to list_tasks first if task reference is ambiguous in SYSTEM_PROMPT

**Checkpoint**: US3 complete - Users can mark tasks as complete via chat

---

## Phase 5: User Story 4 - Task Deletion (Priority: P2)

**Goal**: Enable users to delete tasks via natural language

**Independent Test**: Create a task, then say "Delete the task" and verify task is removed.

### MCP Tool Enhancement (US4)

- [ ] T121 [US4] Verify delete_task_handler queries existing task by task_id in backend/src/mcp/tools.py
- [ ] T122 [US4] Verify delete_task_handler checks task belongs to user_id in backend/src/mcp/tools.py
- [ ] T123 [US4] Verify delete_task_handler deletes task from database
- [ ] T124 [US4] Add error handling for task not found in delete_task_handler
- [ ] T125 [US4] Return deleted task title in response for confirmation message

### Agent Prompt Enhancement (US4)

- [ ] T126 [US4] Update SYSTEM_PROMPT to handle deletion phrases in backend/src/services/agent_service.py
- [ ] T127 [US4] Add instruction to confirm before bulk deletion in SYSTEM_PROMPT

**Checkpoint**: US4 complete - Users can delete tasks via chat

---

## Phase 6: User Story 6 - Conversation Persistence (Priority: P2)

**Goal**: Conversation history persists across sessions

**Independent Test**: Have a conversation, refresh page, verify messages are still displayed.

### Backend Conversation Endpoints (US6)

- [ ] T128 [US6] Implement DELETE /api/{user_id}/conversations/{conversation_id} endpoint in backend/src/api/chat_router.py
- [ ] T129 [US6] Add cascade delete of messages when conversation deleted
- [ ] T130 [US6] Return DeleteConversationResponse with messages_deleted count

### Frontend Conversation Persistence (US6)

- [ ] T131 [US6] Add conversationId state to ChatContainer, persist to localStorage in frontend/src/components/chat/ChatContainer.tsx
- [ ] T132 [US6] Load existing conversation on mount if conversationId in localStorage
- [ ] T133 [US6] Implement deleteConversation(userId, conversationId) in frontend/src/services/chatApi.ts
- [ ] T134 [US6] Add "New Conversation" button to ChatContainer to start fresh
- [ ] T135 [US6] Clear localStorage conversationId when starting new conversation

**Checkpoint**: US6 complete - Conversations persist across page refreshes

---

## Phase 7: User Story 5 - Task Update/Edit (Priority: P3)

**Goal**: Enable users to update task title or description via natural language

**Independent Test**: Create a task, then say "Change the title to X" and verify task is updated.

### MCP Tool Enhancement (US5)

- [ ] T136 [US5] Verify update_task_handler queries existing task by task_id in backend/src/mcp/tools.py
- [ ] T137 [US5] Verify update_task_handler checks task belongs to user_id in backend/src/mcp/tools.py
- [ ] T138 [US5] Verify update_task_handler updates title if provided
- [ ] T139 [US5] Verify update_task_handler updates description if provided
- [ ] T140 [US5] Verify update_task_handler updates updated_at timestamp
- [ ] T141 [US5] Add error handling for task not found in update_task_handler
- [ ] T142 [US5] Add error handling for no changes provided in update_task_handler

### Agent Prompt Enhancement (US5)

- [ ] T143 [US5] Update SYSTEM_PROMPT to handle update/edit/rename phrases in backend/src/services/agent_service.py
- [ ] T144 [US5] Add instruction to confirm which field (title vs description) to update in SYSTEM_PROMPT

**Checkpoint**: US5 complete - Users can update tasks via chat

---

## Phase 8: User Story 7 - Multi-Turn Conversations (Priority: P3)

**Goal**: AI maintains context within conversation for reference resolution

**Independent Test**: Say "Show my tasks", then "Complete the first one" and verify AI understands reference.

### Context Enhancement (US7)

- [ ] T145 [US7] Increase MAX_CONVERSATION_HISTORY default to 20 in backend/src/services/chat_service.py
- [ ] T146 [US7] Update build_message_history to include assistant tool_calls in context in backend/src/services/agent_service.py
- [ ] T147 [US7] Add task list caching in conversation context for number references in backend/src/services/agent_service.py

### Agent Prompt Enhancement (US7)

- [ ] T148 [US7] Update SYSTEM_PROMPT to handle "the first one", "it", "that task" references
- [ ] T149 [US7] Add instruction to use recent list_tasks result for numbered references
- [ ] T150 [US7] Add instruction to use conversation context for pronoun resolution

**Checkpoint**: US7 complete - AI understands context within conversations

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Error Handling Enhancement

- [ ] T151 [P] Add rate limiting middleware for chat endpoints (30 req/min) in backend/src/api/chat_router.py
- [ ] T152 [P] Add X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers
- [ ] T153 [P] Add graceful error handling for Gemini API timeout in backend/src/services/agent_service.py
- [ ] T154 [P] Add graceful error handling for Gemini API rate limit (429) in backend/src/services/agent_service.py
- [ ] T155 [P] Add retry logic with exponential backoff for transient AI errors

### UI/UX Polish

- [ ] T156 [P] Verify all chat UI colors match Phase 2 theme in tailwind.config.ts
- [ ] T157 [P] Add responsive styling for mobile chat interface
- [ ] T158 [P] Add keyboard shortcut hints (Enter to send)
- [ ] T159 [P] Add message timestamp formatting (relative time)
- [ ] T160 [P] Add error toast notifications for failed messages

### Security Hardening

- [ ] T161 [P] Add message content sanitization before storage in backend/src/services/chat_service.py
- [ ] T162 [P] Add conversation ownership validation in all endpoints
- [ ] T163 [P] Add input validation for all API parameters
- [ ] T164 [P] Verify no sensitive data (passwords, tokens) sent to Gemini API

### Performance Optimization

- [ ] T165 [P] Add database indexes verification for query optimization
- [ ] T166 [P] Add connection pooling configuration check for Neon
- [ ] T167 [P] Add frontend optimistic UI update for sent messages
- [ ] T168 [P] Add message loading skeleton while fetching history

### Documentation Updates

- [ ] T169 Update backend/CLAUDE.md with Phase III information
- [ ] T170 Update frontend/CLAUDE.md with Phase III information
- [ ] T171 Update root README.md with chat feature documentation

### Final Validation

- [ ] T172 Run quickstart.md validation steps
- [ ] T173 Verify Phase 2 functionality still works unchanged (SC-013)
- [ ] T174 Verify chat UI matches Phase 2 theme (SC-012)
- [ ] T175 Verify all 5 MCP tools function correctly (SC-005)
- [ ] T176 Test 10+ different phrasings for each operation type (SC-006)

**Checkpoint**: All user stories complete and polished

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    └── No dependencies - start immediately

Phase 2: Foundational
    └── Depends on Phase 1 completion
    └── BLOCKS all user stories

Phase 3: US1+US2 (P1) ──┬── Depends on Phase 2
Phase 4: US3 (P2)       ├── Depends on Phase 2 (can parallel with others)
Phase 5: US4 (P2)       ├── Depends on Phase 2 (can parallel with others)
Phase 6: US6 (P2)       └── Depends on Phase 2 (can parallel with others)

Phase 7: US5 (P3)       ├── Depends on Phase 2
Phase 8: US7 (P3)       └── Depends on Phase 3 (needs base chat working)

Phase 9: Polish
    └── Depends on all desired user stories complete
```

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1+US2 | P1 | None | Phase 2 complete |
| US3 | P2 | None | Phase 2 complete |
| US4 | P2 | None | Phase 2 complete |
| US6 | P2 | None | Phase 2 complete |
| US5 | P3 | None | Phase 2 complete |
| US7 | P3 | US1+US2 | Phase 3 complete |

### Within Each Phase

1. Database changes before model definitions
2. Models before services
3. Services before API endpoints
4. Backend endpoints before frontend API client
5. API client before UI components
6. Components before pages

### Parallel Opportunities

**Phase 2 Parallel Groups:**
```
Group A (can run together):
- T020-T029: All model definitions [P]
- T030-T038: All schema definitions [P]
- T039-T052: MCP tool definitions [P]
```

**Phase 3 Parallel Groups:**
```
Group A (can run together):
- T084-T089: Frontend API client tasks [P]
- T090-T105: Frontend component tasks [P]
```

---

## Parallel Example: Phase 2 Models

```bash
# Launch all model tasks in parallel:
Task T020: "Create ConversationBase class in backend/src/models/conversation.py"
Task T024: "Create MessageBase class in backend/src/models/message.py"

# Launch all schema tasks in parallel:
Task T030: "Create ChatRequest schema in backend/src/api/chat_router.py"
Task T031: "Create ToolCallResult schema in backend/src/api/chat_router.py"
Task T032: "Create ChatResponse schema in backend/src/api/chat_router.py"
```

---

## Implementation Strategy

### MVP First (Phase 1-3 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T071)
3. Complete Phase 3: US1+US2 (T072-T113)
4. **STOP and VALIDATE**: Test add task + list tasks via chat
5. Deploy MVP if ready

### Incremental Delivery

```
Setup → Foundational → US1+US2 (MVP!)
                            ↓
                       Deploy & Demo
                            ↓
                   → US3 (Task Completion)
                            ↓
                       Deploy & Demo
                            ↓
                   → US4 (Task Deletion)
                            ↓
                       Deploy & Demo
                            ↓
                   → US6 (Conversation Persistence)
                            ↓
                       Deploy & Demo
                            ↓
                   → US5+US7 (Edit + Multi-turn)
                            ↓
                       Deploy & Demo
                            ↓
                   → Polish
                            ↓
                       Final Release
```

### Parallel Team Strategy

With 2 developers:
1. Both complete Setup + Foundational together
2. After Foundational:
   - Developer A: Phase 3 (US1+US2 MVP)
   - Developer B: Phase 4+5 (US3+US4 tools)
3. After MVP verified:
   - Developer A: Phase 6 (US6 persistence)
   - Developer B: Phase 7+8 (US5+US7)
4. Both: Phase 9 polish

---

## Summary

| Phase | Tasks | User Stories | Priority |
|-------|-------|--------------|----------|
| 1. Setup | T001-T007 (7) | - | - |
| 2. Foundational | T008-T071 (64) | - | - |
| 3. US1+US2 | T072-T113 (42) | Task Creation + Listing | P1 |
| 4. US3 | T114-T120 (7) | Task Completion | P2 |
| 5. US4 | T121-T127 (7) | Task Deletion | P2 |
| 6. US6 | T128-T135 (8) | Conversation Persistence | P2 |
| 7. US5 | T136-T144 (9) | Task Update | P3 |
| 8. US7 | T145-T150 (6) | Multi-Turn Context | P3 |
| 9. Polish | T151-T176 (26) | Cross-cutting | - |

**Total Tasks**: 176
**MVP Tasks**: 113 (Phases 1-3)
**Parallel Opportunities**: 50+ tasks marked [P]

---

## Notes

- [P] tasks = different files, no dependencies, can run together
- [Story] label maps task to specific user story
- Each user story is independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate
- Phase 2 authentication is reused - DO NOT modify existing auth code
- All new files only - existing Phase 2 code is NOT modified
