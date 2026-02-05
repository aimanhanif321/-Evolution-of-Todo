# Research: Advanced Todo Features

**Feature**: 004-advanced-todo-features
**Date**: 2026-01-29
**Status**: Complete

## Research Summary

This document consolidates research findings for implementing advanced todo features in Taskora.

---

## 1. Priority Enum Implementation

**Decision**: Use Python Enum with string values stored in VARCHAR column

**Rationale**:
- SQLModel/SQLAlchemy handles enum serialization natively
- String values are human-readable in database
- Easy to extend without migrations (add new enum value)
- Frontend receives string values directly in JSON

**Alternatives Considered**:
- Integer codes (0-3): Rejected - Less readable, harder to debug
- Separate priority table: Rejected - Over-engineering for 4 fixed values

**Implementation**:
```python
class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"
```

---

## 2. Many-to-Many Tag Relationship

**Decision**: Use SQLModel link_model with TaskTag junction table

**Rationale**:
- Proper relational design for many-to-many
- Allows querying tags independently
- Supports tag deletion with cascade
- Enables tag reuse across tasks

**Alternatives Considered**:
- JSON array in Task table: Rejected - No referential integrity, harder to query
- Comma-separated string: Rejected - Parsing overhead, no foreign key support

**Implementation**:
```python
class TaskTag(SQLModel, table=True):
    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
```

---

## 3. Search Implementation

**Decision**: Use PostgreSQL ILIKE for case-insensitive search

**Rationale**:
- Simple to implement with existing SQLModel
- Adequate performance for <10,000 tasks per user
- No additional infrastructure required

**Alternatives Considered**:
- Full-text search (tsvector): Deferred - Overkill for title/description search
- Elasticsearch: Rejected - Additional infrastructure complexity

**Implementation**:
```python
from sqlalchemy import or_
query = query.filter(
    or_(
        Task.title.ilike(f"%{search}%"),
        Task.description.ilike(f"%{search}%")
    )
)
```

---

## 4. Filter Query Building

**Decision**: Chain SQLAlchemy filters dynamically based on query parameters

**Rationale**:
- Flexible composition of multiple filters
- Single database query for all filter combinations
- Easy to add new filter types

**Implementation Pattern**:
```python
def get_tasks(session, user_id, filters: TaskFilters):
    query = session.query(Task).filter(Task.user_id == user_id)

    if filters.status == "pending":
        query = query.filter(Task.completed == False)
    elif filters.status == "completed":
        query = query.filter(Task.completed == True)

    if filters.priority:
        query = query.filter(Task.priority.in_(filters.priority))

    if filters.due_before:
        query = query.filter(Task.due_date <= filters.due_before)

    return query.all()
```

---

## 5. Sort Implementation

**Decision**: Use SQLAlchemy order_by with direction parameter

**Rationale**:
- Native database sorting is most efficient
- Supports compound sorting if needed
- Null handling built into PostgreSQL

**Sort Priority Mapping** (for priority sort):
```python
PRIORITY_ORDER = {"urgent": 0, "high": 1, "medium": 2, "low": 3}

# Using case expression for custom sort order
from sqlalchemy import case
priority_order = case(
    (Task.priority == "urgent", 0),
    (Task.priority == "high", 1),
    (Task.priority == "medium", 2),
    (Task.priority == "low", 3),
)
query = query.order_by(priority_order)
```

---

## 6. Recurring Task Logic

**Decision**: Create new task instance on completion, link via parent_task_id

**Rationale**:
- Preserves completed task history
- Clear parent-child relationship for auditing
- Same logic works for all recurrence patterns

**Recurrence Calculation**:
```python
from datetime import timedelta
from dateutil.relativedelta import relativedelta

def calculate_next_due_date(task: Task) -> datetime:
    base_date = task.due_date or datetime.utcnow()

    if task.recurrence_rule == "daily":
        return base_date + timedelta(days=1)
    elif task.recurrence_rule == "weekly":
        return base_date + timedelta(weeks=1)
    elif task.recurrence_rule == "monthly":
        return base_date + relativedelta(months=1)
    elif task.recurrence_rule == "custom":
        return base_date + timedelta(days=task.recurrence_interval)
```

**Edge Case - Month End**:
```python
# dateutil.relativedelta handles month-end correctly
# Jan 31 + 1 month = Feb 28/29
```

---

## 7. Due Date Display

**Decision**: Calculate relative time on frontend for real-time updates

**Rationale**:
- Frontend can update display without API calls
- User's local timezone automatically applied
- Common pattern in modern apps

**Frontend Implementation**:
```typescript
function getRelativeDueDate(dueDate: string): { text: string; urgency: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffMs < 0) return { text: "Overdue", urgency: "overdue" };
  if (diffHours < 24) return { text: `Due in ${Math.round(diffHours)} hours`, urgency: "today" };
  if (diffDays < 2) return { text: "Due tomorrow", urgency: "tomorrow" };
  return { text: `Due in ${Math.round(diffDays)} days`, urgency: "later" };
}
```

---

## 8. Browser Notifications

**Decision**: Use Web Notifications API with permission request on first reminder enable

**Rationale**:
- Native browser support, no additional libraries
- Works when app tab is open (background notifications require service worker)
- Graceful fallback to in-app notifications

**Permission Flow**:
```typescript
async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}
```

**Notification Display**:
```typescript
function showTaskReminder(task: Task) {
  if (Notification.permission !== "granted") {
    // Fallback: show in-app notification
    showInAppNotification(task);
    return;
  }

  new Notification(`Task Due: ${task.title}`, {
    body: task.due_date ? `Due at ${formatTime(task.due_date)}` : "No due date",
    icon: "/icon.png",
    tag: `task-${task.id}`, // Prevents duplicate notifications
  });
}
```

---

## 9. Reminder Polling Strategy

**Decision**: Frontend polls for due reminders every 60 seconds when app is active

**Rationale**:
- Simple implementation without background workers
- Acceptable for MVP (1-minute granularity)
- No server-side scheduler needed

**Alternatives Considered**:
- Server-side scheduler (Celery Beat): Deferred - Requires additional infrastructure
- WebSocket push: Deferred - Adds complexity for MVP
- Service Worker: Deferred - Background notifications in Phase VII

**Implementation**:
```typescript
useEffect(() => {
  const checkReminders = async () => {
    const tasks = await fetchTasksWithDueReminders();
    tasks.forEach(task => {
      if (shouldNotify(task)) {
        showTaskReminder(task);
        markReminderSent(task.id);
      }
    });
  };

  const interval = setInterval(checkReminders, 60000);
  return () => clearInterval(interval);
}, []);
```

---

## 10. Database Indexes

**Decision**: Add composite indexes for common query patterns

**Indexes to Create**:
```sql
-- Filter by user and priority (common)
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);

-- Filter by user and due date (sorting/filtering)
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);

-- Reminder polling (find pending reminders)
CREATE INDEX idx_tasks_reminder ON tasks(reminder_at) WHERE reminder_sent = FALSE;

-- Tag lookup by user
CREATE INDEX idx_tags_user ON tags(user_id);
```

---

## 11. Date Picker Library

**Decision**: Use native HTML date/time inputs with custom styling

**Rationale**:
- No additional dependencies
- Native mobile date pickers on iOS/Android
- Sufficient for MVP requirements

**Alternatives Considered**:
- react-datepicker: Available if native inputs insufficient
- date-fns for formatting: Will use for relative time display

**Implementation**:
```tsx
<input
  type="datetime-local"
  value={dueDate?.toISOString().slice(0, 16) || ""}
  onChange={(e) => setDueDate(new Date(e.target.value))}
  className="..."
/>
```

---

## 12. Filter State Management

**Decision**: Store filter state in URL query parameters

**Rationale**:
- Shareable/bookmarkable filtered views
- Browser back/forward navigation works
- State survives page refresh

**URL Format**:
```
/dashboard?status=pending&priority=high,urgent&tags=work&sort=due_date&order=asc
```

**Implementation**:
```typescript
import { useSearchParams } from "next/navigation";

function useTaskFilters() {
  const searchParams = useSearchParams();

  return {
    status: searchParams.get("status") || "all",
    priority: searchParams.get("priority")?.split(",") || [],
    tags: searchParams.get("tags")?.split(",") || [],
    sortBy: searchParams.get("sort") || "created_at",
    sortOrder: searchParams.get("order") || "desc",
  };
}
```

---

## Conclusion

All technical decisions are finalized. No NEEDS CLARIFICATION items remain. Ready to proceed with data model design and API contracts.
