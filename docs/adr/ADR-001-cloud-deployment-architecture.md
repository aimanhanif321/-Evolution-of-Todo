# ADR-001: Cloud Deployment Architecture

**Status**: Accepted
**Date**: 2026-02-05
**Deciders**: Development Team
**Technical Story**: Phase V - Advanced Cloud Deployment

## Context

Taskora needs to be deployed to production with the following requirements:
- High availability and scalability
- Real-time event synchronization across clients
- Automated CI/CD pipeline
- Local development parity with production
- Support for advanced features (recurring tasks, reminders)

## Decision Drivers

- **Scalability**: Must handle 1000+ concurrent users
- **Reliability**: 99.9% uptime target
- **Developer Experience**: Easy local development, fast CI/CD
- **Cost Efficiency**: Minimize cloud infrastructure costs
- **Vendor Flexibility**: Avoid deep vendor lock-in

## Considered Options

### Container Orchestration

1. **DigitalOcean Kubernetes (DOKS)** - Managed Kubernetes
2. **AWS EKS** - Amazon's managed Kubernetes
3. **Google GKE** - Google's managed Kubernetes
4. **Docker Swarm** - Simpler orchestration
5. **Serverless (Vercel/Railway)** - Managed platform

### Event Streaming

1. **Redpanda** - Kafka-compatible, lightweight
2. **Apache Kafka** - Industry standard, heavy
3. **AWS SQS/SNS** - Cloud-native, vendor lock-in
4. **RabbitMQ** - Traditional message queue

### Service Mesh

1. **Dapr** - Application-level abstractions
2. **Istio** - Full-featured service mesh
3. **Linkerd** - Lightweight service mesh
4. **No mesh** - Direct service communication

### Database

1. **Neon DB** - Serverless PostgreSQL
2. **DigitalOcean Managed PostgreSQL** - Traditional managed
3. **AWS RDS** - Amazon's managed database
4. **Self-hosted PostgreSQL** - Full control

## Decision

### Primary Choices

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Orchestration | **DOKS** | Cost-effective, simple, good DX |
| Event Streaming | **Redpanda** | Kafka-compatible, low memory, no ZooKeeper |
| Service Mesh | **Dapr** | Application-focused, gradual adoption |
| Database | **Neon DB** | Serverless, branching, generous free tier |
| CI/CD | **GitHub Actions** | Native integration, free for public repos |
| Container Registry | **GHCR** | Native to GitHub, no extra accounts |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOKS Cluster                             │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Frontend Pod    │  │  Backend Pod     │                    │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                    │
│  │  │  Next.js   │  │  │  │  FastAPI   │  │                    │
│  │  └────────────┘  │  │  └────────────┘  │                    │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                    │
│  │  │Dapr Sidecar│  │  │  │Dapr Sidecar│  │                    │
│  │  └────────────┘  │  │  └────────────┘  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │    Redpanda      │  │     Redis        │                    │
│  │  (Event Broker)  │  │  (State Store)   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            NGINX Ingress (TLS via cert-manager)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │     Neon DB      │
                    │ (Serverless PG)  │
                    └──────────────────┘
```

## Consequences

### Positive

- **DOKS**: 40% cheaper than EKS/GKE for similar specs
- **Redpanda**: 10x less memory than Kafka, simpler operations
- **Dapr**: Incremental adoption, works locally without sidecars
- **Neon DB**: Auto-scaling, branching for development, pay-per-use
- **GitHub Actions**: No additional CI/CD tooling needed

### Negative

- **DOKS**: Smaller ecosystem than AWS/GCP
- **Redpanda**: Less mature than Kafka (but Kafka-compatible)
- **Dapr**: Additional learning curve, sidecar overhead
- **Neon DB**: Vendor lock-in for database branching features

### Mitigations

- **Multi-cloud ready**: Helm charts work on any Kubernetes
- **Kafka compatibility**: Can migrate to Kafka if needed
- **Dapr abstraction**: Can swap components without code changes
- **Standard PostgreSQL**: Neon uses standard PG, migration possible

## Alternatives Rejected

### AWS EKS
- **Rejected because**: Higher cost, more complex IAM setup
- **Would reconsider if**: Enterprise scale requirements, existing AWS investment

### Apache Kafka
- **Rejected because**: High memory requirements (6GB+), needs ZooKeeper
- **Would reconsider if**: Need for Kafka Connect, Kafka Streams

### Istio Service Mesh
- **Rejected because**: Heavy resource footprint, steep learning curve
- **Would reconsider if**: Need for advanced traffic management, mTLS everywhere

### Self-hosted PostgreSQL
- **Rejected because**: Operational burden, backup complexity
- **Would reconsider if**: Need for specific extensions, cost at very high scale

## Compliance

- **Data Residency**: Neon DB supports region selection
- **Encryption**: TLS everywhere, secrets in Kubernetes Secrets
- **Audit Logging**: All events published to Redpanda for audit trail

## Related Decisions

- ADR-002: Dapr Component Configuration (planned)
- ADR-003: CI/CD Pipeline Design (planned)

## References

- [Dapr Documentation](https://docs.dapr.io/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [Neon DB Documentation](https://neon.tech/docs/)
- [DOKS Documentation](https://docs.digitalocean.com/products/kubernetes/)
