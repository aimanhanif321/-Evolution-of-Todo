# Quickstart: Advanced Todo Features

**Feature**: 004-advanced-todo-features
**Date**: 2026-01-29

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- PostgreSQL client (optional, for direct DB access)

## Local Development Setup

### 1. Start the Stack

```bash
# From repository root
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Backend API (port 8000)
- Frontend (port 3000)

### 2. Run Database Migration

After implementing the new models, run:

```bash
# From backend directory
cd backend
alembic upgrade head
```

Or with Docker:
```bash
docker-compose exec backend alembic upgrade head
```

### 3. Verify API

```bash
# Health check
curl http://localhost:8000/health

# Get tasks (requires auth token)
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/tasks
```

### 4. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Access at http://localhost:3000

---

## Feature Verification Checklist

### Priority Management

1. Create a task with "Urgent" priority
2. Verify red badge displays on TaskCard
3. Edit task, change to "Low" priority
4. Verify gray badge displays
5. Sort by priority - urgent tasks should appear first

### Tags

1. Create a new tag "Work" with blue color
2. Create a task and assign the "Work" tag
3. Verify blue tag badge displays on TaskCard
4. Create another tag "Home" with green color
5. Assign both tags to a task
6. Filter by "Work" tag - only tagged tasks appear

### Search

1. Create tasks with different titles
2. Type in search box
3. Verify results filter as you type (300ms debounce)
4. Verify "No results" message when no matches

### Filters

1. Create completed and pending tasks
2. Select "Active" filter - only pending tasks show
3. Select "High" priority filter - only high priority tasks show
4. Combine filters - verify AND logic works
5. Clear all filters - all tasks show

### Sorting

1. Create tasks with different due dates
2. Sort by "Due Date (soonest)" - nearest deadline first
3. Sort by "Priority (highest)" - urgent first
4. Sort by "Alphabetical" - A-Z order

### Due Dates

1. Create task with due date tomorrow
2. Verify "Due tomorrow" displays with yellow indicator
3. Create task with due date in past
4. Verify "Overdue" displays with red warning

### Recurring Tasks

1. Create task with "Daily" recurrence and due date today
2. Mark task as complete
3. Verify new task created with tomorrow's due date
4. Verify original task shows as completed
5. Test weekly and monthly recurrence

### Reminders

1. Create task with due date 5 minutes from now
2. Set reminder to "10 min before" (should trigger soon)
3. Wait for reminder time
4. Verify browser notification appears
5. Click notification - should navigate to task

---

## API Testing Examples

### Create Task with All Fields

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing all fields",
    "priority": "high",
    "due_date": "2026-02-01T18:00:00Z",
    "reminder_at": "2026-02-01T17:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "weekly",
    "tag_ids": [1, 2]
  }'
```

### Search and Filter

```bash
# Search
curl "http://localhost:8000/api/tasks?search=meeting" \
  -H "Authorization: Bearer <token>"

# Filter by priority and status
curl "http://localhost:8000/api/tasks?status=pending&priority=high,urgent" \
  -H "Authorization: Bearer <token>"

# Sort by due date
curl "http://localhost:8000/api/tasks?sort_by=due_date&order=asc" \
  -H "Authorization: Bearer <token>"

# Combined
curl "http://localhost:8000/api/tasks?status=pending&priority=high&tags=1,2&sort_by=due_date&order=asc" \
  -H "Authorization: Bearer <token>"
```

### Tag Management

```bash
# Create tag
curl -X POST http://localhost:8000/api/tags \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Work", "color": "#3B82F6"}'

# List tags
curl http://localhost:8000/api/tags \
  -H "Authorization: Bearer <token>"

# Delete tag
curl -X DELETE http://localhost:8000/api/tags/1 \
  -H "Authorization: Bearer <token>"
```

### Complete Recurring Task

```bash
curl -X PATCH http://localhost:8000/api/tasks/1/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

---

## Troubleshooting

### Database Migration Fails

```bash
# Check current migration state
alembic current

# Show migration history
alembic history

# Reset and retry (WARNING: data loss)
alembic downgrade base
alembic upgrade head
```

### Tags Not Showing on Tasks

1. Verify TaskTag junction records exist
2. Check that task query includes eager loading of tags
3. Verify frontend is parsing `tags` array from response

### Notifications Not Working

1. Check browser notification permissions
2. Open console, look for permission errors
3. Verify `Notification.permission === "granted"`
4. Check if reminder_at is in the past

### Filter/Sort Not Working

1. Verify query parameters are URL-encoded
2. Check backend logs for SQL errors
3. Test with single filter first, then combine

---

## Production Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
COHERE_API_KEY=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.taskora.com
```

### Deploy to DOKS

```bash
# Update Helm values
helm upgrade --install taskora ./helm/taskora \
  --namespace taskora \
  -f ./helm/taskora/values-prod.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n taskora

# Check logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -f

# Test endpoint
curl https://taskora.yourdomain.com/health
```

---

## Next Steps

After implementing Phase VI features:

1. Run full verification checklist above
2. Test on mobile viewport
3. Load test with 100+ tasks
4. Verify Dapr events publishing
5. Document any issues for Phase VII
