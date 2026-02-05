---
name: audit.fetch_history
description: Fetches the complete audit history of a task.
---

## Input
{
  "task_id": "integer"
}

## Output
{
  "events": [
    {
      "event_type": "string",
      "timestamp": "YYYY-MM-DDTHH:MM:SS",
      "user_id": "string"
    }
  ]
}

