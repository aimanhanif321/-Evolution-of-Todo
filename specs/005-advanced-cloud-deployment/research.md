# Research: Phase V - Advanced Cloud Deployment

**Feature**: 005-advanced-cloud-deployment
**Date**: 2026-02-04
**Status**: Complete

## Overview

This document captures research findings for implementing Phase V Advanced Cloud Deployment of Taskora.

---

## Research Topic 1: Dapr Integration Patterns

### Question
How should the backend integrate with Dapr for pub/sub, state management, and secrets?

### Findings

**Dapr Python SDK (dapr-client)**
- Official SDK: `pip install dapr`
- Provides `DaprClient` class for all building blocks
- Handles connection to sidecar (default: localhost:3500)
- Supports async operations via `DaprClientAsync`

**Integration Pattern:**
```python
from dapr.clients import DaprClient

# Pub/Sub
with DaprClient() as client:
    client.publish_event(
        pubsub_name="pubsub",
        topic_name="task-events",
        data=json.dumps(event_data),
        data_content_type="application/json"
    )

# State Management
with DaprClient() as client:
    client.save_state(
        store_name="statestore",
        key="session:123",
        value=json.dumps(session_data)
    )

# Secrets
with DaprClient() as client:
    secret = client.get_secret(
        store_name="kubernetes-secrets",
        key="DATABASE_URL"
    )
```

**Graceful Degradation:**
```python
import os

DAPR_ENABLED = os.getenv("DAPR_HTTP_PORT") is not None

async def publish_event(topic: str, data: dict):
    if DAPR_ENABLED:
        # Use Dapr
        with DaprClient() as client:
            client.publish_event("pubsub", topic, json.dumps(data))
    else:
        # Log only (local dev without Dapr)
        logger.info(f"Event (no Dapr): {topic} - {data}")
```

### Decision
Use Dapr Python SDK with graceful fallback when sidecar is unavailable.

### Rationale
- Type-safe client with good error handling
- Handles retries and connection management
- Graceful degradation enables simpler local development

---

## Research Topic 2: Event Schema Design

### Question
What event schema should be used for task events?

### Findings

**CloudEvents v1.0 Specification:**
- Industry standard for event data
- Dapr natively supports CloudEvents
- Required attributes: specversion, type, source, id
- Optional: time, datacontenttype, data

**Event Schema:**
```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/api/tasks",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "time": "2026-02-04T12:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "taskId": "123",
    "title": "Buy groceries",
    "status": "pending",
    "priority": "medium",
    "userId": "456"
  }
}
```

**Event Types:**
| Type | Description |
|------|-------------|
| task.created | New task created |
| task.updated | Task fields modified |
| task.completed | Task marked complete |
| task.deleted | Task deleted |
| task.recurred | New instance from recurring |
| task.reminder | Reminder triggered |

### Decision
Use CloudEvents v1.0 specification for all events.

### Rationale
- Dapr native support (automatic envelope handling)
- Interoperability with other systems
- Includes essential metadata (time, source, type)

---

## Research Topic 3: Real-Time Sync Architecture

### Question
How should task updates be pushed to connected clients in real-time?

### Findings

**Option 1: Server-Sent Events (SSE)**
- Unidirectional (server → client)
- Native browser support (EventSource API)
- Works through proxies and load balancers
- Simple implementation

**Option 2: WebSockets**
- Bidirectional
- More complex setup
- Requires sticky sessions or Redis adapter
- Overkill for one-way updates

**Option 3: Polling**
- Simple but inefficient
- Higher latency
- More server load

**SSE Implementation:**
```python
# Backend (FastAPI)
from fastapi.responses import StreamingResponse

async def event_generator():
    while True:
        event = await event_queue.get()
        yield f"data: {json.dumps(event)}\n\n"

@app.get("/api/events/stream")
async def event_stream():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

```typescript
// Frontend
const eventSource = new EventSource('/api/events/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI
};
```

### Decision
Use Server-Sent Events (SSE) for real-time updates, with polling fallback.

### Rationale
- Simpler than WebSockets for one-way updates
- Native browser support
- Works through most proxies and CDNs

---

## Research Topic 4: Recurring Task Engine

### Question
How should recurring tasks be processed to generate new instances?

### Findings

**Dapr Cron Binding:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: recurrence-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "@every 1m"
```

**Backend Endpoint:**
```python
@app.post("/api/recurrence/check")
async def check_recurrence():
    # Find completed recurring tasks
    tasks = await db.query(
        Task.select().where(
            Task.status == "completed",
            Task.recurrence_pattern.is_not(None)
        )
    )

    for task in tasks:
        next_due = calculate_next_due(task)
        if next_due:
            new_task = await create_next_instance(task, next_due)
            await publish_event("task.recurred", {
                "oldTaskId": task.id,
                "newTask": new_task
            })
```

**Recurrence Pattern:**
```python
class RecurrencePattern(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

def calculate_next_due(task: Task) -> datetime | None:
    if task.recurrence_pattern == "daily":
        return task.due_date + timedelta(days=1)
    elif task.recurrence_pattern == "weekly":
        return task.due_date + timedelta(weeks=1)
    # ...
```

### Decision
Dapr cron binding triggers backend endpoint every minute to process recurring tasks.

### Rationale
- Leverages existing Dapr infrastructure
- No separate service needed
- Naturally scales with backend replicas (Dapr handles leader election)

---

## Research Topic 5: Multi-Cloud Deployment Strategy

### Question
How should Helm charts be structured for multi-cloud compatibility?

### Findings

**Helm Values Structure:**
```yaml
# values.yaml (defaults)
backend:
  replicas: 2
  image: ghcr.io/user/taskora-backend:latest

frontend:
  replicas: 2
  image: ghcr.io/user/taskora-frontend:latest

database:
  external: false
  host: postgresql

ingress:
  className: nginx
  tls:
    enabled: true
    issuer: letsencrypt-prod
```

```yaml
# values-doks.yaml
database:
  external: true
  host: do-managed-db.example.com

ingress:
  className: nginx
```

```yaml
# values-gke.yaml
database:
  external: true
  host: cloud-sql-proxy

ingress:
  className: gce
```

**Cloud-Specific Differences:**

| Aspect | DOKS | GKE | AKS |
|--------|------|-----|-----|
| Ingress | NGINX | GCE / NGINX | AGIC |
| DB | DO Managed | Cloud SQL | Azure DB |
| Secrets | K8s Secrets | Secret Manager | Key Vault |
| Registry | DOCR / GHCR | GCR / GHCR | ACR / GHCR |

### Decision
Primary deployment to DOKS; Helm charts parameterized for GKE/AKS compatibility.

### Rationale
- DOKS is cost-effective for initial deployment
- Helm abstractions enable future multi-cloud
- No cloud-specific tools needed yet

---

## Conclusion

All research topics have been resolved. The implementation can proceed with:

1. **Dapr SDK** with graceful degradation
2. **CloudEvents v1.0** for event schema
3. **SSE** for real-time sync
4. **Dapr cron bindings** for recurring tasks
5. **Parameterized Helm charts** for multi-cloud
