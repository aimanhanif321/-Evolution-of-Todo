# Taskora - Phase V: Cloud-Native Deployment

A full-stack AI-powered todo application deployed on DigitalOcean Kubernetes (DOKS) with Dapr microservices and Kafka/Redpanda event streaming.

## Overview

Taskora is a production-ready todo application featuring:
- User authentication with JWT tokens
- AI-powered chatbot for task management
- Event-driven architecture with Kafka/Redpanda
- Dapr service mesh for resilience and observability
- Kubernetes deployment with auto-scaling
- CI/CD pipeline with GitHub Actions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16+, TypeScript, Tailwind CSS |
| Backend | Python 3.11+, FastAPI, SQLModel |
| Database | PostgreSQL 15 (DigitalOcean Managed) |
| Event Streaming | Redpanda (Kafka-compatible) |
| Service Mesh | Dapr 1.13+ |
| Container Orchestration | Kubernetes (DOKS) |
| CI/CD | GitHub Actions |
| Ingress | NGINX with cert-manager |

## Architecture

```
                                    ┌─────────────────┐
                                    │   Internet      │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │ DO Load Balancer│
                                    │  + TLS (Let's   │
                                    │    Encrypt)     │
                                    └────────┬────────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          │         NGINX Ingress               │
                          └──────────────────┬──────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
     ┌────────▼────────┐           ┌────────▼────────┐           ┌─────────▼─────────┐
     │    Frontend     │           │    Backend      │           │    Redpanda       │
     │   (Next.js)     │◄─────────►│   (FastAPI)     │◄─────────►│   (Kafka)         │
     │   + Dapr        │  Dapr     │   + Dapr        │  Pub/Sub  │                   │
     └─────────────────┘  Invoke   └────────┬────────┘           └───────────────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  PostgreSQL     │
                                   │  (DO Managed)   │
                                   └─────────────────┘
```

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/taskora/evolution-of-todos.git
cd evolution-of-todos

# Start with Docker Compose (standard)
docker-compose up

# Start with Dapr (for event streaming)
docker-compose -f docker-compose.yml -f docker-compose.dapr.yml up

# Access the application
open http://localhost:3000
```

### Production Deployment

See [Deployment Guide](#production-deployment-guide) below.

## Development Setup

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- Docker and Docker Compose
- kubectl and helm (for Kubernetes)
- doctl CLI (for DigitalOcean)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your values

# Run locally
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your values

# Run locally
npm run dev
```

## Production Deployment Guide

### 1. Create DOKS Cluster

```bash
# Using the provided script
./scripts/create-cluster.sh

# Or manually with doctl
doctl kubernetes cluster create taskora-cluster \
  --region nyc1 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=3" \
  --version 1.28.2-do.0
```

### 2. Install Dapr

```bash
dapr init -k --wait
dapr status -k
```

### 3. Create Secrets

```bash
kubectl create namespace taskora

kubectl create secret generic taskora-secrets -n taskora \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:25060/db?sslmode=require' \
  --from-literal=COHERE_API_KEY='your-cohere-key' \
  --from-literal=GEMINI_API_KEY='your-gemini-key' \
  --from-literal=BETTER_AUTH_SECRET='your-auth-secret'
```

### 4. Apply Dapr Components

```bash
kubectl apply -f dapr/components/ -n taskora
```

### 5. Deploy with Helm

```bash
helm upgrade --install taskora ./helm/taskora \
  -n taskora \
  -f ./helm/taskora/values-prod.yaml \
  --set ingress.hosts[0].host=taskora.example.com
```

### 6. Configure DNS

Point your domain to the DigitalOcean Load Balancer IP:

```bash
kubectl get svc -n ingress-nginx
```

## CI/CD Pipeline

The GitHub Actions pipeline automatically:

1. **On PR**: Runs linting and tests
2. **On push to main**:
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Deploys to production via Helm

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO API token for cluster access |

See [docs/github-secrets.md](docs/github-secrets.md) for setup instructions.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Toggle completion

### Chat (AI)
- `POST /api/chat` - Send message to AI chatbot
- `GET /api/chat/history` - Get conversation history

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe
- `GET /metrics` - Application metrics

## Event Topics

| Topic | Events | Retention |
|-------|--------|-----------|
| `task-events` | created, updated, deleted | 7 days |
| `user-events` | login, logout, registered | 30 days |
| `chat-events` | message_sent, response_received | 14 days |

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Dapr Debugging Guide](docs/dapr-debugging.md)
- [GitHub Secrets Setup](docs/github-secrets.md)
- [Troubleshooting](docs/troubleshooting.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
