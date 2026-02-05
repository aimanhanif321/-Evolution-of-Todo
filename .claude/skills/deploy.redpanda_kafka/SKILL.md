---
name: deploy.redpanda_kafka
description: Sets up a Redpanda Cloud Kafka cluster or local Redpanda instance for event streaming.
purpose: Provides a Kafka-compatible event-driven architecture for task and reminder events.
subagents:
  - deployment_agent
Input:

{
  "mode": "cloud|local",
  "topics": ["task-events", "reminders", "task-updates"]
}
Output Example:

{
  "success": true,
  "kafka_cluster_url": "your-cluster.cloud.redpanda.com"
}

