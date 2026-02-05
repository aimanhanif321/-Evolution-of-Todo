# API Contracts: Advanced Todo Features

**Feature**: 004-advanced-todo-features
**Date**: 2026-01-29
**Base URL**: `/api`

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Task Endpoints

### GET /api/tasks

List tasks with filtering, sorting, and search.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | - | Search in title and description (case-insensitive) |
| status | string | all | Filter: `all`, `pending`, `completed` |
| priority | string | - | Filter by priority (comma-separated): `low,medium,high,urgent` |
| tags | string | - | Filter by tag IDs (comma-separated): `1,2,3` |
| due_before | ISO date | - | Tasks due before this date |
| due_after | ISO date | - | Tasks due after this date |
| overdue | boolean | - | If `true`, only overdue incomplete tasks |
| sort_by | string | created_at | Sort field: `created_at`, `due_date`, `priority`, `title` |
| order | string | desc | Sort order: `asc`, `desc` |

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete Phase VI",
    "description": "Implement all advanced features",
    "completed": false,
    "user_id": "user-123",
    "priority": "high",
    "due_date": "2026-02-01T18:00:00Z",
    "reminder_at": "2026-02-01T17:00:00Z",
    "reminder_sent": false,
    "is_recurring": true,
    "recurrence_rule": "weekly",
    "recurrence_interval": null,
    "parent_task_id": null,
    "created_at": "2026-01-29T10:00:00Z",
    "updated_at": "2026-01-29T10:00:00Z",
    "tags": [
      {"id": 1, "name": "Work", "color": "#3B82F6", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"}
    ]
  }
]
```

---

### POST /api/tasks

Create a new task.

**Request Body**:
```json
{
  "title": "Complete Phase VI",
  "description": "Implement all advanced features",
  "priority": "high",
  "due_date": "2026-02-01T18:00:00Z",
  "reminder_at": "2026-02-01T17:00:00Z",
  "is_recurring": true,
  "recurrence_rule": "weekly",
  "recurrence_interval": null,
  "tag_ids": [1, 2]
}
```

**Required Fields**: `title`

**Optional Fields**: All others (defaults applied)

**Response**: `201 Created`
```json
{
  "id": 1,
  "title": "Complete Phase VI",
  "description": "Implement all advanced features",
  "completed": false,
  "user_id": "user-123",
  "priority": "high",
  "due_date": "2026-02-01T18:00:00Z",
  "reminder_at": "2026-02-01T17:00:00Z",
  "reminder_sent": false,
  "is_recurring": true,
  "recurrence_rule": "weekly",
  "recurrence_interval": null,
  "parent_task_id": null,
  "created_at": "2026-01-29T10:00:00Z",
  "updated_at": "2026-01-29T10:00:00Z",
  "tags": [
    {"id": 1, "name": "Work", "color": "#3B82F6", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"},
    {"id": 2, "name": "Important", "color": "#EF4444", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"}
  ]
}
```

**Errors**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token

---

### GET /api/tasks/{task_id}

Get a single task by ID.

**Response**: `200 OK` (same schema as POST response)

**Errors**:
- `404 Not Found`: Task not found or not owned by user

---

### PUT /api/tasks/{task_id}

Update a task.

**Request Body**: Same as POST (all fields optional)
```json
{
  "title": "Updated title",
  "priority": "urgent",
  "tag_ids": [1, 3]
}
```

**Response**: `200 OK` (updated task)

**Errors**:
- `404 Not Found`: Task not found

---

### DELETE /api/tasks/{task_id}

Delete a task.

**Response**: `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Errors**:
- `404 Not Found`: Task not found

---

### PATCH /api/tasks/{task_id}/complete

Toggle task completion. For recurring tasks, creates next occurrence.

**Request Body**:
```json
{
  "completed": true
}
```

**Response**: `200 OK`

**For non-recurring tasks**:
```json
{
  "id": 1,
  "completed": true,
  ...
}
```

**For recurring tasks** (when completing):
```json
{
  "completed_task": {
    "id": 1,
    "completed": true,
    ...
  },
  "next_task": {
    "id": 2,
    "completed": false,
    "due_date": "2026-02-08T18:00:00Z",
    "parent_task_id": 1,
    ...
  }
}
```

---

### PATCH /api/tasks/{task_id}/reminder

Update task reminder.

**Request Body**:
```json
{
  "reminder_at": "2026-02-01T17:00:00Z"
}
```

Or clear reminder:
```json
{
  "reminder_at": null
}
```

**Response**: `200 OK` (updated task)

---

### GET /api/tasks/reminders

Get tasks with pending reminders (for notification polling).

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| before | ISO date | Reminders due before this time (default: now) |

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete Phase VI",
    "due_date": "2026-02-01T18:00:00Z",
    "reminder_at": "2026-02-01T17:00:00Z"
  }
]
```

---

## Tag Endpoints

### GET /api/tags

List all tags for current user.

**Response**: `200 OK`
```json
[
  {"id": 1, "name": "Work", "color": "#3B82F6", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"},
  {"id": 2, "name": "Home", "color": "#22C55E", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"},
  {"id": 3, "name": "Study", "color": "#A855F7", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"}
]
```

---

### POST /api/tags

Create a new tag.

**Request Body**:
```json
{
  "name": "Work",
  "color": "#3B82F6"
}
```

**Response**: `201 Created`
```json
{"id": 1, "name": "Work", "color": "#3B82F6", "user_id": "user-123", "created_at": "2026-01-29T09:00:00Z"}
```

**Errors**:
- `400 Bad Request`: Tag name already exists for this user

---

### PUT /api/tags/{tag_id}

Update a tag.

**Request Body**:
```json
{
  "name": "Work Projects",
  "color": "#2563EB"
}
```

**Response**: `200 OK` (updated tag)

---

### DELETE /api/tags/{tag_id}

Delete a tag. Removes from all tasks.

**Response**: `200 OK`
```json
{
  "message": "Tag deleted successfully"
}
```

---

## Request/Response Schemas

### TaskCreate

```typescript
interface TaskCreate {
  title: string;                      // required, 1-255 chars
  description?: string;               // optional
  priority?: "low" | "medium" | "high" | "urgent";  // default: "medium"
  due_date?: string;                  // ISO 8601 datetime
  reminder_at?: string;               // ISO 8601 datetime
  is_recurring?: boolean;             // default: false
  recurrence_rule?: "daily" | "weekly" | "monthly" | "custom";
  recurrence_interval?: number;       // required if recurrence_rule is "custom"
  tag_ids?: number[];                 // array of tag IDs
}
```

### TaskRead

```typescript
interface TaskRead {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  reminder_at: string | null;
  reminder_sent: boolean;
  is_recurring: boolean;
  recurrence_rule: "daily" | "weekly" | "monthly" | "custom" | null;
  recurrence_interval: number | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
  tags: TagRead[];
}
```

### TaskUpdate

```typescript
interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  reminder_at?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: "daily" | "weekly" | "monthly" | "custom" | null;
  recurrence_interval?: number | null;
  tag_ids?: number[];
}
```

### TagCreate

```typescript
interface TagCreate {
  name: string;        // required, 1-50 chars, unique per user
  color?: string;      // hex color, default: "#6366F1"
}
```

### TagRead

```typescript
interface TagRead {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}
```

### TagUpdate

```typescript
interface TagUpdate {
  name?: string;
  color?: string;
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

Or for validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Dapr Events

### task.created

Published when a new task is created.

```json
{
  "event_id": "uuid",
  "event_type": "task.created",
  "timestamp": "2026-01-29T10:00:00Z",
  "user_id": "user-123",
  "payload": {
    "task_id": 1,
    "title": "Complete Phase VI",
    "priority": "high",
    "due_date": "2026-02-01T18:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "weekly",
    "tags": ["Work", "Important"]
  }
}
```

### task.updated

Published when a task is updated.

```json
{
  "event_id": "uuid",
  "event_type": "task.updated",
  "timestamp": "2026-01-29T10:30:00Z",
  "user_id": "user-123",
  "payload": {
    "task_id": 1,
    "title": "Complete Phase VI",
    "completed": false,
    "priority": "urgent",
    "changes": ["priority"]
  }
}
```

### task.completed

Published when a task is marked complete.

```json
{
  "event_id": "uuid",
  "event_type": "task.completed",
  "timestamp": "2026-01-29T11:00:00Z",
  "user_id": "user-123",
  "payload": {
    "task_id": 1,
    "completed": true
  }
}
```

### task.recurred

Published when a recurring task generates its next instance.

```json
{
  "event_id": "uuid",
  "event_type": "task.recurred",
  "timestamp": "2026-01-29T11:00:00Z",
  "user_id": "user-123",
  "payload": {
    "original_task_id": 1,
    "new_task_id": 2,
    "next_due_date": "2026-02-08T18:00:00Z"
  }
}
```

### task.reminder

Published when a reminder is due (for notification service).

```json
{
  "event_id": "uuid",
  "event_type": "task.reminder",
  "timestamp": "2026-02-01T17:00:00Z",
  "user_id": "user-123",
  "payload": {
    "task_id": 1,
    "title": "Complete Phase VI",
    "due_date": "2026-02-01T18:00:00Z",
    "reminder_type": "1_hour_before"
  }
}
```

### task.deleted

Published when a task is deleted.

```json
{
  "event_id": "uuid",
  "event_type": "task.deleted",
  "timestamp": "2026-01-29T12:00:00Z",
  "user_id": "user-123",
  "payload": {
    "task_id": 1
  }
}
```
