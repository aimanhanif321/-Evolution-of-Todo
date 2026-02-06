---
name: deploy.kubernetes_cluster
description: Creates a Kubernetes cluster on the specified cloud provider (DigitalOcean, GCP, Azure).
purpose: Set up a production-ready Kubernetes environment for deploying applications.
subagents:
  - deployment_agent
{
  "cloud_provider": "digitalocean|gcp|azure",
  "cluster_name": "string",
  "node_count": "integer",
  "region": "string"
}

{
  "success": true,
  "cluster_id": "12345"
}