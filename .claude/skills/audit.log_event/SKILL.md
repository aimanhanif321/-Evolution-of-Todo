---
name: audit.log_event
description: Logs task events like create, update, delete, and complete.
---

## Input
{
  "event_type": "created|updated|deleted|completed",
  "task_id": "integer",
  "user_id": "string",
  "timestamp": "YYYY-MM-DDTHH:MM:SS"
}

## Output
{
  "success": true
}

