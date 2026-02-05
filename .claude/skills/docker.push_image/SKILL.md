---
name: docker.push_image
description: Pushes a Docker image to the specified container registry (DockerHub, GCR, or Azure ACR).
purpose: Make the Docker image available for Kubernetes or cloud deployment.
subagents:
  - docker_agent
Input Example:

{
  "image_name": "myproject-backend:latest",
  "registry": "dockerhub",
  "username": "myuser",
  "password": "mypassword"
}
Output Example:

{
  "success": true,
  "registry_url": "docker.io/myuser/myproject-backend:latest"
}
