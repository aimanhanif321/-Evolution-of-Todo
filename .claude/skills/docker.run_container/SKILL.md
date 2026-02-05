---
name: docker.run_container
description: Runs a Docker container locally for testing purposes.
purpose: Validate that the Docker image works correctly before deploying to Kubernetes.
subagents:
  - docker_agent
Input Example:

{
  "image_name": "myproject-backend:latest",
  "container_name": "backend-test",
  "ports": ["8000:8000"],
  "environment": {"ENV": "development"}
}
Output Example:

{
  "success": true,
  "container_id": "abcdef1234"
}