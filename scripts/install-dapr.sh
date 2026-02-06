#!/bin/bash
# Install Dapr on DigitalOcean Kubernetes cluster
# Requires: kubectl configured with DOKS cluster context

set -e

DAPR_VERSION="${DAPR_VERSION:-1.13}"
NAMESPACE="${NAMESPACE:-dapr-system}"
ENABLE_MTLS="${ENABLE_MTLS:-true}"
ENABLE_HA="${ENABLE_HA:-true}"

echo "================================================"
echo "Dapr Installation Script for DOKS"
echo "================================================"
echo "  Dapr Version: $DAPR_VERSION"
echo "  Namespace: $NAMESPACE"
echo "  mTLS Enabled: $ENABLE_MTLS"
echo "  HA Mode: $ENABLE_HA"
echo "================================================"

# Check prerequisites
check_prerequisites() {
    echo ""
    echo "[1/5] Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo "ERROR: kubectl is not installed"
        echo "  Install: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    echo "  kubectl: $(kubectl version --client --short 2>/dev/null || kubectl version --client -o yaml | grep gitVersion | head -1)"

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        echo "ERROR: Cannot connect to Kubernetes cluster"
        echo "  Ensure kubeconfig is configured correctly"
        exit 1
    fi
    echo "  Cluster: Connected"
}

# Install Dapr CLI if not present
install_dapr_cli() {
    echo ""
    echo "[2/5] Checking Dapr CLI..."

    if command -v dapr &> /dev/null; then
        CURRENT_VERSION=$(dapr --version 2>/dev/null | grep "CLI version" | awk '{print $3}' || echo "unknown")
        echo "  Dapr CLI already installed: $CURRENT_VERSION"
    else
        echo "  Installing Dapr CLI..."

        # Detect OS
        OS=$(uname -s | tr '[:upper:]' '[:lower:]')
        ARCH=$(uname -m)

        case $ARCH in
            x86_64) ARCH="amd64" ;;
            aarch64|arm64) ARCH="arm64" ;;
        esac

        # Download and install
        DAPR_INSTALL_URL="https://raw.githubusercontent.com/dapr/cli/master/install/install.sh"

        if [[ "$OS" == "darwin" ]] || [[ "$OS" == "linux" ]]; then
            curl -fsSL $DAPR_INSTALL_URL | /bin/bash
        elif [[ "$OS" == "mingw"* ]] || [[ "$OS" == "msys"* ]]; then
            echo "  For Windows, please install Dapr CLI manually:"
            echo "    winget install Dapr.CLI"
            echo "  Or download from: https://github.com/dapr/cli/releases"
            exit 1
        fi

        echo "  Dapr CLI installed successfully"
    fi
}

# Initialize Dapr on Kubernetes
init_dapr_kubernetes() {
    echo ""
    echo "[3/5] Initializing Dapr on Kubernetes..."

    # Check if Dapr is already installed
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        EXISTING_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l)
        if [ "$EXISTING_PODS" -gt 0 ]; then
            echo "  Dapr appears to be already installed in $NAMESPACE"
            echo "  Checking status..."
            dapr status -k || true

            read -p "  Do you want to upgrade Dapr? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "  Upgrading Dapr..."
                dapr upgrade -k --runtime-version $DAPR_VERSION
            else
                echo "  Skipping Dapr installation"
                return 0
            fi
        fi
    fi

    # Build init command with options
    INIT_CMD="dapr init -k --runtime-version $DAPR_VERSION"

    if [ "$ENABLE_HA" = "true" ]; then
        INIT_CMD="$INIT_CMD --enable-ha"
    fi

    if [ "$ENABLE_MTLS" = "true" ]; then
        INIT_CMD="$INIT_CMD --enable-mtls"
    fi

    INIT_CMD="$INIT_CMD --wait"

    echo "  Running: $INIT_CMD"
    eval $INIT_CMD

    echo "  Dapr initialized successfully"
}

# Verify Dapr installation
verify_dapr() {
    echo ""
    echo "[4/5] Verifying Dapr installation..."

    # Wait for pods to be ready
    echo "  Waiting for Dapr pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/part-of=dapr -n $NAMESPACE --timeout=120s || {
        echo "WARNING: Some Dapr pods may not be ready yet"
    }

    # Show Dapr status
    echo ""
    echo "  Dapr Status:"
    dapr status -k

    # Verify mTLS if enabled
    if [ "$ENABLE_MTLS" = "true" ]; then
        echo ""
        echo "  Checking mTLS configuration..."
        kubectl get configuration daprsystem -n $NAMESPACE -o jsonpath='{.spec.mtls.enabled}' 2>/dev/null && echo " (mTLS enabled)" || echo "  mTLS configuration not found (may use default)"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "[5/5] Installation Summary"
    echo "================================================"
    echo "  Dapr Version: $DAPR_VERSION"
    echo "  Namespace: $NAMESPACE"
    echo "  mTLS: $ENABLE_MTLS"
    echo "  HA Mode: $ENABLE_HA"
    echo ""
    echo "  Components installed:"
    kubectl get pods -n $NAMESPACE -o custom-columns=NAME:.metadata.name,STATUS:.status.phase --no-headers
    echo ""
    echo "================================================"
    echo "  Next steps:"
    echo "    1. Apply Dapr components: ./scripts/apply-dapr-components.sh"
    echo "    2. Deploy application: ./scripts/deploy-production.sh"
    echo "    3. Verify health: ./scripts/verify-health.sh"
    echo ""
    echo "  Access Dapr Dashboard:"
    echo "    dapr dashboard -k -p 9999"
    echo "================================================"
}

# Main execution
main() {
    check_prerequisites
    install_dapr_cli
    init_dapr_kubernetes
    verify_dapr
    print_summary
}

main "$@"
