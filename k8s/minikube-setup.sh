#!/bin/bash
# Minikube Setup Script for Taskora
# This script initializes a local Kubernetes cluster for development

set -e

echo "=== Taskora Minikube Setup ==="
echo ""

# Check prerequisites
command -v minikube >/dev/null 2>&1 || { echo "Error: minikube is not installed. Please install it first."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "Error: kubectl is not installed. Please install it first."; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "Error: helm is not installed. Please install it first."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: docker is not installed. Please install it first."; exit 1; }

# Configuration
CLUSTER_NAME="minikube"
CPUS=${MINIKUBE_CPUS:-4}
MEMORY=${MINIKUBE_MEMORY:-8192}
DRIVER=${MINIKUBE_DRIVER:-docker}

echo "Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  CPUs: $CPUS"
echo "  Memory: ${MEMORY}MB"
echo "  Driver: $DRIVER"
echo ""

# Check if cluster already exists
if minikube status -p $CLUSTER_NAME >/dev/null 2>&1; then
    echo "Minikube cluster '$CLUSTER_NAME' already exists."
    read -p "Do you want to delete and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deleting existing cluster..."
        minikube delete -p $CLUSTER_NAME
    else
        echo "Using existing cluster."
        minikube start -p $CLUSTER_NAME
        exit 0
    fi
fi

# Start Minikube
echo "Starting Minikube cluster..."
minikube start \
    -p $CLUSTER_NAME \
    --driver=$DRIVER \
    --cpus=$CPUS \
    --memory=$MEMORY \
    --disk-size=20g

# Enable required addons
echo ""
echo "Enabling addons..."
minikube addons enable ingress -p $CLUSTER_NAME
minikube addons enable metrics-server -p $CLUSTER_NAME
minikube addons enable dashboard -p $CLUSTER_NAME

# Wait for ingress controller
echo ""
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s 2>/dev/null || echo "Ingress controller may still be starting..."

# Display cluster info
echo ""
echo "=== Cluster Ready ==="
echo ""
echo "Minikube IP: $(minikube ip -p $CLUSTER_NAME)"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Docker environment:"
echo "   eval \$(minikube docker-env -p $CLUSTER_NAME)"
echo ""
echo "2. Build container images:"
echo "   docker build -t taskora/frontend:latest ./frontend"
echo "   docker build -t taskora/backend:latest ./backend"
echo ""
echo "3. Create secrets:"
echo "   kubectl create namespace taskora"
echo "   kubectl create secret generic taskora-db-credentials --from-literal=password=changeme -n taskora"
echo "   kubectl create secret generic taskora-secrets --from-literal=DATABASE_URL=postgresql://taskora:changeme@taskora-database:5432/taskora -n taskora"
echo ""
echo "4. Deploy with Helm:"
echo "   helm install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-dev.yaml"
echo ""
echo "5. Add to /etc/hosts:"
echo "   $(minikube ip -p $CLUSTER_NAME) taskora.local"
echo ""
echo "6. Access application:"
echo "   http://taskora.local"
echo ""
echo "=== Setup Complete ==="
