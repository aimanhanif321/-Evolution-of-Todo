#!/bin/bash
# Create DigitalOcean Kubernetes cluster for Taskora
# Requires: doctl CLI authenticated

set -e

CLUSTER_NAME="${CLUSTER_NAME:-taskora-cluster}"
REGION="${REGION:-nyc1}"
NODE_SIZE="${NODE_SIZE:-s-2vcpu-4gb}"
NODE_COUNT="${NODE_COUNT:-3}"
K8S_VERSION="${K8S_VERSION:-1.28.2-do.0}"
CERT_MANAGER_VERSION="${CERT_MANAGER_VERSION:-v1.14.4}"
NGINX_INGRESS_VERSION="${NGINX_INGRESS_VERSION:-4.9.1}"

echo "================================================"
echo "DOKS Cluster Creation Script for Taskora"
echo "================================================"
echo "  Cluster Name: $CLUSTER_NAME"
echo "  Region: $REGION"
echo "  Node Size: $NODE_SIZE"
echo "  Node Count: $NODE_COUNT"
echo "  K8s Version: $K8S_VERSION"
echo "================================================"

# Check prerequisites
echo ""
echo "[1/8] Checking prerequisites..."
if ! command -v doctl &> /dev/null; then
    echo "ERROR: doctl is not installed"
    echo "  Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "ERROR: kubectl is not installed"
    echo "  Install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "ERROR: helm is not installed"
    echo "  Install: https://helm.sh/docs/intro/install/"
    exit 1
fi

echo "  All prerequisites met"

# Create cluster
echo ""
echo "[2/8] Creating DOKS cluster: $CLUSTER_NAME"
doctl kubernetes cluster create "$CLUSTER_NAME" \
  --region "$REGION" \
  --node-pool "name=worker-pool;size=$NODE_SIZE;count=$NODE_COUNT" \
  --version "$K8S_VERSION" \
  --wait

echo ""
echo "[3/8] Fetching kubeconfig..."
doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"

echo ""
echo "[4/8] Verifying cluster..."
kubectl get nodes
kubectl cluster-info

# Install NGINX Ingress Controller
echo ""
echo "[5/8] Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --version $NGINX_INGRESS_VERSION \
  --set controller.publishService.enabled=true \
  --wait

echo "  Waiting for LoadBalancer IP..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
echo "  Ingress Controller IP: $INGRESS_IP"

# Install cert-manager
echo ""
echo "[6/8] Installing cert-manager $CERT_MANAGER_VERSION..."
helm repo add jetstack https://charts.jetstack.io 2>/dev/null || true
helm repo update

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/$CERT_MANAGER_VERSION/cert-manager.crds.yaml

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version ${CERT_MANAGER_VERSION#v} \
  --set installCRDs=false \
  --wait

echo "  Waiting for cert-manager pods..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

echo "  Verifying cert-manager installation..."
kubectl get pods -n cert-manager

# Install Dapr
echo ""
echo "[7/8] Installing Dapr..."
if command -v dapr &> /dev/null; then
    dapr init -k --runtime-version 1.13 --enable-mtls --wait
else
    echo "  Dapr CLI not found. Install with:"
    echo "    curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash"
    echo "  Then run: dapr init -k --runtime-version 1.13 --enable-mtls --wait"
fi

echo "  Verifying Dapr installation..."
dapr status -k 2>/dev/null || echo "  Dapr status check skipped (CLI may not be installed)"

# Create namespace
echo ""
echo "[8/8] Creating taskora namespace..."
kubectl create namespace taskora --dry-run=client -o yaml | kubectl apply -f -

# Summary
echo ""
echo "================================================"
echo "Cluster Setup Complete!"
echo "================================================"
echo ""
echo "  Cluster: $CLUSTER_NAME"
echo "  Region: $REGION"
echo "  Nodes: $NODE_COUNT x $NODE_SIZE"
echo "  Ingress IP: $INGRESS_IP"
echo ""
echo "Components Installed:"
echo "  - NGINX Ingress Controller"
echo "  - cert-manager $CERT_MANAGER_VERSION"
echo "  - Dapr 1.13 (with mTLS)"
echo ""
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo ""
echo "1. Configure DNS: Point your domain to $INGRESS_IP"
echo ""
echo "2. Create secrets:"
echo "   kubectl create secret generic taskora-secrets -n taskora \\"
echo "     --from-literal=DATABASE_URL='postgresql://...' \\"
echo "     --from-literal=COHERE_API_KEY='...' \\"
echo "     --from-literal=BETTER_AUTH_SECRET='...'"
echo ""
echo "3. Apply Dapr components:"
echo "   ./scripts/apply-dapr-components.sh"
echo ""
echo "4. Update values-prod.yaml with your domain and email"
echo ""
echo "5. Deploy with Helm:"
echo "   helm upgrade --install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-prod.yaml"
echo ""
echo "6. Verify deployment:"
echo "   ./scripts/verify-health.sh"
echo "================================================"
