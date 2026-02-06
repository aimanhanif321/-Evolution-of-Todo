---
name: deploy.helm_charts
description: Deploys frontend and backend applications to Kubernetes using Helm charts.
purpose: Automate deployment of your microservices with versioned Helm packages.
subagents:
  - deployment_agent
Input:

{
  "chart_name": "string",
  "release_name": "string",
  "namespace": "string",
  "values_file": "string"
}
Output Example:

{
  "success": true,
  "release_status": "deployed"
}
