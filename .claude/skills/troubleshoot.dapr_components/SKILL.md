---
name: troubleshoot.dapr_components
description: Verifies Dapr sidecars and components (Pub/Sub, State, Bindings, Secrets) are healthy.
purpose: Detect Dapr misconfigurations or failing components and provide remediation steps.
subagents:
  - error_fixing_agent
Input Example:

{
  "namespace": "default"
}
Output Example:

{
  "success": true,
  "issues_found": [
    {
      "component": "pubsub.kafka",
      "error": "Cannot connect to Kafka broker",
      "suggested_fix": "Check broker URL, credentials, and network policies"
    }
  ]
}