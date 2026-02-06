---
name: troubleshoot.redpanda_kafka
description: Checks Kafka cluster health, topic availability, and consumer/producer connectivity.
purpose: Detect and fix Kafka-related deployment issues.
subagents:
  - error_fixing_agent
Input Example:

{
  "topics": ["task-events", "reminders", "task-updates"]
}
Output Example:

{
  "success": true,
  "issues_found": [
    {
      "topic": "reminders",
      "error": "Producer not connected",
      "suggested_fix": "Verify SASL credentials and bootstrap server URL"
    }
  ]
}

