# Data Model: Phase V - Advanced Cloud Deployment

**Feature**: 005-advanced-cloud-deployment
**Date**: 2026-02-04
**Database**: PostgreSQL 15

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA MODEL                                      │
│                                                                             │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │    User     │       │    Task     │       │    Tag      │               │
│  ├─────────────┤       ├─────────────┤       ├─────────────┤               │
│  │ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │               │
│  │ email       │  │    │ title       │    │  │ name        │               │
│  │ name        │  │    │ description │    │  │ color       │               │
│  │ created_at  │  └───►│ user_id (FK)│◄───┘  │ user_id (FK)│◄──┐          │
│  └─────────────┘       │ status      │       └─────────────┘   │          │
│                        │ priority    │                         │          │
│                        │ due_date    │       ┌─────────────┐   │          │
│                        │ recurrence  │       │  TaskTag    │   │          │
│                        │ reminder_at │       ├─────────────┤   │          │
│                        │ created_at  │◄──────│ task_id (FK)│   │          │
│                        │ updated_at  │       │ tag_id (FK) │───┘          │
│                        └─────────────┘       └─────────────┘              │
│                              │                                             │
│                              │                                             │
│                              ▼                                             │
│                        ┌─────────────┐                                     │
│                        │  AuditLog   │                                     │
│                        ├─────────────┤                                     │
│                        │ id (PK)     │                                     │
│                        │ event_type  │                                     │
│                        │ entity_type │                                     │
│                        │ entity_id   │                                     │
│                        │ user_id     │                                     │
│                        │ data (JSON) │                                     │
│                        │ created_at  │                                     │
│                        └─────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Definitions

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(100) | NOT NULL | Display name |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |

**Indexes:**
- `idx_user_email` on `email` (unique)

### Task

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Optional description |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, in_progress, completed |
| priority | ENUM | NOT NULL, DEFAULT 'medium' | low, medium, high, urgent |
| due_date | TIMESTAMP | NULL | Optional due date/time |
| recurrence_pattern | ENUM | NULL | daily, weekly, monthly, custom |
| recurrence_config | JSONB | NULL | Custom recurrence config |
| reminder_at | TIMESTAMP | NULL | When to send reminder |
| reminder_sent | BOOLEAN | NOT NULL, DEFAULT FALSE | Reminder sent flag |
| user_id | UUID | FK → User.id, NOT NULL | Owner user |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_task_user_id` on `user_id`
- `idx_task_status` on `status`
- `idx_task_priority` on `priority`
- `idx_task_due_date` on `due_date` (for overdue queries)
- `idx_task_reminder` on `reminder_at, reminder_sent` (for cron check)
- `idx_task_search` GIN on `to_tsvector('english', title || ' ' || COALESCE(description, ''))` (full-text)

### Tag

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(50) | NOT NULL | Tag name |
| color | VARCHAR(7) | NOT NULL, DEFAULT '#6b7280' | Hex color code |
| user_id | UUID | FK → User.id, NOT NULL | Owner user |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_tag_user_id` on `user_id`
- `idx_tag_name_user` UNIQUE on `(name, user_id)` (unique per user)

### TaskTag (Junction Table)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| task_id | UUID | FK → Task.id, NOT NULL | Task reference |
| tag_id | UUID | FK → Tag.id, NOT NULL | Tag reference |

**Constraints:**
- PRIMARY KEY on `(task_id, tag_id)`
- ON DELETE CASCADE for both foreign keys

### AuditLog

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| event_type | VARCHAR(50) | NOT NULL | task.created, task.updated, etc. |
| entity_type | VARCHAR(50) | NOT NULL | task, tag, user |
| entity_id | UUID | NOT NULL | ID of affected entity |
| user_id | UUID | NULL | Acting user (NULL for system) |
| data | JSONB | NOT NULL | Event payload |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event time |

**Indexes:**
- `idx_audit_entity` on `(entity_type, entity_id)`
- `idx_audit_user` on `user_id`
- `idx_audit_created` on `created_at` (for time-range queries)

---

## Enumerations

### TaskStatus

```python
class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
```

### Priority

```python
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
```

### RecurrencePattern

```python
class RecurrencePattern(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"
```

---

## Recurrence Configuration

For `CUSTOM` recurrence, `recurrence_config` stores:

```json
{
  "frequency": "weekly",
  "interval": 2,
  "daysOfWeek": [1, 3, 5],
  "endDate": "2026-12-31",
  "maxOccurrences": 52
}
```

| Field | Type | Description |
|-------|------|-------------|
| frequency | string | day, week, month, year |
| interval | integer | Every N frequency units |
| daysOfWeek | array | 0=Sun, 1=Mon, ..., 6=Sat |
| endDate | string | ISO date when recurrence stops |
| maxOccurrences | integer | Max instances to create |

---

## Event Schemas (CloudEvents)

### TaskEvent

```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/api/tasks",
  "id": "uuid-v4",
  "time": "2026-02-04T12:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "taskId": "uuid",
    "title": "Task title",
    "description": "Optional description",
    "status": "pending",
    "priority": "medium",
    "dueDate": "2026-02-10T09:00:00Z",
    "userId": "uuid",
    "tags": ["uuid1", "uuid2"]
  }
}
```

### ReminderEvent

```json
{
  "specversion": "1.0",
  "type": "task.reminder",
  "source": "/api/reminders",
  "id": "uuid-v4",
  "time": "2026-02-04T09:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "taskId": "uuid",
    "taskTitle": "Task title",
    "userId": "uuid",
    "dueDate": "2026-02-04T10:00:00Z"
  }
}
```

### RecurrenceEvent

```json
{
  "specversion": "1.0",
  "type": "task.recurred",
  "source": "/api/recurrence",
  "id": "uuid-v4",
  "time": "2026-02-04T12:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "originalTaskId": "uuid",
    "newTaskId": "uuid",
    "newDueDate": "2026-02-05T09:00:00Z",
    "userId": "uuid"
  }
}
```

---

## Migration Strategy

Alembic migrations handle schema evolution:

1. **002_phase_vi_features.py** - Already exists, adds priority, tags, due_date, recurrence, reminder fields
2. **003_audit_log.py** - Adds AuditLog table for event persistence
3. **004_search_index.py** - Adds full-text search GIN index

```python
# Example migration: 003_audit_log.py
def upgrade():
    op.create_table(
        'audit_log',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_entity', 'audit_log', ['entity_type', 'entity_id'])
    op.create_index('idx_audit_user', 'audit_log', ['user_id'])
    op.create_index('idx_audit_created', 'audit_log', ['created_at'])
```

---

## State Store (Redis)

Used via Dapr state management for:

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `session:{userId}` | User session data | 24h |
| `notification:{userId}` | Pending notifications | 1h |
| `lock:reminder:{taskId}` | Distributed lock | 60s |

---

## Validation Rules

### Task

- `title`: 1-255 characters, required
- `description`: 0-5000 characters, optional
- `due_date`: Must be future date if set
- `reminder_at`: Must be before `due_date` if both set
- `recurrence_pattern`: Cannot set without `due_date`

### Tag

- `name`: 1-50 characters, alphanumeric + spaces/hyphens
- `color`: Valid hex color (#RRGGBB)
- Unique name per user

---

## State Transitions

### Task Status

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  ▼                                                      │
PENDING ──────► IN_PROGRESS ──────► COMPLETED ──────────┘
  │                   │                  │
  │                   │                  │ (if recurring)
  │                   │                  ▼
  │                   │            NEW PENDING TASK
  │                   │
  └───────────────────┴──────────────► (delete allowed from any state)
```

Valid transitions:
- `pending` → `in_progress` → `completed`
- `pending` → `completed` (skip in_progress)
- Any state → deleted
- `completed` + recurring → creates new `pending` task
