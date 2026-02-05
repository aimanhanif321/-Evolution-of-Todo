---
name: deploy.dapr_components
description: Deploys full Dapr runtime components (Pub/Sub, State, Bindings, Secrets) on Kubernetes.
purpose: Enable microservices communication, state management, and event-driven features.
subagents:
  - deployment_agent
  - dapr_agent


  {
  "namespace": "default",
  "components": ["pubsub", "state", "bindings", "secrets"]
}
{
  "success": true,
  "components_deployed": ["pubsub", "state", "bindings", "secrets"]
}