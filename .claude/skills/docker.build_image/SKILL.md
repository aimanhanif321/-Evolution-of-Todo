---
name: docker.build_image
description: Builds a Docker image from the specified Dockerfile and context.
purpose: Package application code into a Docker image for deployment.
subagents:
  - docker_agent
Input Example:

{
  "dockerfile_path": "./backend/Dockerfile",
  "context_path": "./backend",
  "image_name": "myproject-backend:latest"
}
Output Example:

{
  "success": true,
  "image_id": "sha256:abcd1234"
}