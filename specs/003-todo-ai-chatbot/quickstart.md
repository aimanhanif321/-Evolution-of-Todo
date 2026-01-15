# Quickstart Guide: Todo AI Chatbot

**Feature**: 003-todo-ai-chatbot
**Date**: 2026-01-15

---

## Prerequisites

Before starting Phase III development, ensure:

- [ ] Phase II Taskora application is fully functional
- [ ] Backend server runs without errors
- [ ] Frontend connects to backend successfully
- [ ] User authentication works (register, login, JWT)
- [ ] Task CRUD operations work via Phase II UI
- [ ] Database connection to Neon PostgreSQL is active

---

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key (free tier)
3. Copy the key for later use

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# Install new dependency
pip install google-generativeai>=0.3.0

# Update requirements.txt
pip freeze > requirements.txt

# Add environment variable
echo "GEMINI_API_KEY=your_api_key_here" >> .env
```

### 3. Run Database Migration

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "add_chat_tables"

# Review the generated migration file in alembic/versions/

# Apply migration
alembic upgrade head
```

### 4. Verify New Tables

```bash
# Connect to database and verify
psql $DATABASE_URL -c "\dt"

# Should show:
#  conversations
#  messages
#  tasks (existing)
#  users (existing)
```

### 5. Test Backend Locally

```bash
cd backend

# Start server
uvicorn src.main:app --reload --port 8000

# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 6. Frontend Setup

No additional dependencies needed. The chat UI will use existing Tailwind configuration.

```bash
cd frontend

# Start development server
npm run dev
# or
pnpm dev

# Open http://localhost:3000
```

---

## Development Order

Follow this implementation sequence:

### Phase 1: Backend Core (Days 1-2)

1. **Database Models** (`backend/src/models/`)
   - Create `conversation.py`
   - Create `message.py`
   - Add to `__init__.py` exports

2. **MCP Tools** (`backend/src/mcp/`)
   - Create `tools.py` with 5 tool functions
   - Implement add_task, list_tasks, complete_task, delete_task, update_task

3. **Agent Service** (`backend/src/services/`)
   - Create `agent_service.py`
   - Integrate Gemini SDK
   - Implement tool calling logic

4. **Chat Service** (`backend/src/services/`)
   - Create `chat_service.py`
   - Implement stateless conversation handling
   - Message persistence logic

5. **Chat Router** (`backend/src/api/`)
   - Create `chat_router.py`
   - POST /api/{user_id}/chat endpoint
   - GET conversation endpoints

### Phase 2: Frontend UI (Days 3-4)

1. **Chat Components** (`frontend/src/components/chat/`)
   - ChatContainer.tsx
   - MessageList.tsx
   - MessageBubble.tsx
   - ChatInput.tsx
   - ToolIndicator.tsx

2. **Chat Page** (`frontend/src/app/dashboard/chat/`)
   - page.tsx

3. **API Client** (`frontend/src/services/`)
   - chatApi.ts

4. **Navigation Update**
   - Add chat link to Sidebar

### Phase 3: Integration & Testing (Day 5)

1. End-to-end testing
2. Error handling verification
3. UI/UX polish
4. Performance optimization

---

## File Structure to Create

```
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py          # Update exports
│   │   ├── conversation.py      # NEW
│   │   └── message.py           # NEW
│   ├── api/
│   │   ├── __init__.py          # Update exports
│   │   └── chat_router.py       # NEW
│   ├── services/
│   │   ├── chat_service.py      # NEW
│   │   └── agent_service.py     # NEW
│   └── mcp/
│       ├── __init__.py          # NEW
│       └── tools.py             # NEW
└── alembic/
    └── versions/
        └── xxx_add_chat_tables.py  # NEW (auto-generated)

frontend/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── chat/
│   │           └── page.tsx     # NEW
│   ├── components/
│   │   └── chat/
│   │       ├── ChatContainer.tsx   # NEW
│   │       ├── MessageList.tsx     # NEW
│   │       ├── MessageBubble.tsx   # NEW
│   │       ├── ChatInput.tsx       # NEW
│   │       └── ToolIndicator.tsx   # NEW
│   └── services/
│       └── chatApi.ts           # NEW
```

---

## Testing Checklist

### Backend Tests

```bash
cd backend

# Test chat endpoint
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'

# Expected response with task creation
```

### Manual Test Cases

| Test | Input | Expected Result |
|------|-------|-----------------|
| Add task | "Add buy milk" | Task created, confirmation message |
| List tasks | "Show my tasks" | List of user's tasks |
| Complete task | "Mark first task done" | Task marked complete |
| Delete task | "Delete buy milk" | Task removed |
| Update task | "Change buy milk to buy almond milk" | Task title updated |
| Conversation persists | Refresh page | Previous messages visible |
| Error handling | Empty message | Friendly error message |

---

## Environment Variables

### Backend (.env)

```env
# Existing Phase II variables
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your_jwt_secret

# New Phase III variables
GEMINI_API_KEY=your_gemini_api_key
MAX_CONVERSATION_HISTORY=20
CHAT_RATE_LIMIT=30
```

### Frontend (.env.local)

```env
# Existing - no changes needed
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Common Issues & Solutions

### Issue: Gemini API Rate Limit

**Symptom**: 429 errors from Gemini API

**Solution**:
- Implement exponential backoff
- Show friendly "please wait" message
- Consider caching common responses

### Issue: JWT Token Expired

**Symptom**: 401 errors on chat requests

**Solution**:
- Reuse Phase II token refresh logic
- Redirect to login on expiration

### Issue: Database Connection Pool Exhausted

**Symptom**: Slow responses, timeout errors

**Solution**:
- Ensure async database operations
- Verify connection pooling settings in Neon

### Issue: Chat UI Not Matching Theme

**Symptom**: Visual inconsistency with Phase II

**Solution**:
- Reference `tailwind.config.ts` for colors
- Use existing component classes
- Check `globals.css` for base styles

---

## Useful Commands

```bash
# Backend
uvicorn src.main:app --reload              # Start dev server
alembic upgrade head                        # Run migrations
alembic downgrade -1                        # Rollback last migration
pytest tests/                               # Run tests

# Frontend
npm run dev                                 # Start dev server
npm run build                               # Build for production
npm run lint                                # Check code style

# Database
psql $DATABASE_URL                          # Connect to DB
\dt                                         # List tables
\d+ conversations                           # Describe table
```

---

## Success Criteria Verification

Before marking Phase III complete, verify:

- [ ] User can send messages via chat UI
- [ ] AI responds with natural language
- [ ] Tasks created via chat appear in Phase II task list
- [ ] Conversation history persists across page refresh
- [ ] All 5 MCP tools work correctly
- [ ] Error messages are user-friendly
- [ ] UI matches existing Phase II theme
- [ ] Phase II functionality still works
- [ ] Authentication works seamlessly
- [ ] Mobile responsive layout works
