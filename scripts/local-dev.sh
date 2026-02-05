#!/bin/bash
# =============================================================================
# Taskora Local Development Startup Script
# =============================================================================
#
# Usage:
#   ./scripts/local-dev.sh             # Start without Dapr (lighter)
#   ./scripts/local-dev.sh --with-dapr # Start with Dapr + Redpanda (full stack)
#   ./scripts/local-dev.sh --stop      # Stop all services
#   ./scripts/local-dev.sh --clean     # Stop and remove volumes
#
# Prerequisites:
#   - Docker Desktop with Docker Compose v2
#   - At least 4GB RAM allocated to Docker
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default options
WITH_DAPR=false
STOP=false
CLEAN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --with-dapr)
            WITH_DAPR=true
            shift
            ;;
        --stop)
            STOP=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --with-dapr  Start with Dapr sidecars and Redpanda (full event streaming)"
            echo "  --stop       Stop all running services"
            echo "  --clean      Stop services and remove all volumes"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Change to project root
cd "$PROJECT_ROOT"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi

    # Check Docker is running
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose v2 is not available${NC}"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites satisfied${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"

    if [ "$WITH_DAPR" = true ]; then
        docker compose -f docker-compose.yml -f docker-compose.dapr.yml down
    else
        docker compose down
    fi

    echo -e "${GREEN}Services stopped${NC}"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}Stopping services and removing volumes...${NC}"

    # Stop with both compose files to ensure everything is cleaned
    docker compose -f docker-compose.yml -f docker-compose.dapr.yml down -v 2>/dev/null || true
    docker compose down -v 2>/dev/null || true

    echo -e "${GREEN}Clean up complete${NC}"
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    echo -e "${YELLOW}Waiting for $service to be healthy...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}$service is healthy${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "\n${RED}$service failed to become healthy after $max_attempts attempts${NC}"
    return 1
}

# Function to start services
start_services() {
    echo -e "${BLUE}Starting Taskora local development environment...${NC}"
    echo ""

    if [ "$WITH_DAPR" = true ]; then
        echo -e "${YELLOW}Mode: Full stack with Dapr + Redpanda${NC}"
        echo ""

        # Build and start with Dapr overlay
        docker compose -f docker-compose.yml -f docker-compose.dapr.yml up -d --build

        echo ""
        echo -e "${BLUE}Waiting for services to be ready...${NC}"

        # Wait for backend
        wait_for_health "Backend" "http://localhost:8000/health" 60

        # Wait for Redpanda (via console)
        wait_for_health "Redpanda Console" "http://localhost:8080" 60

        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}   Taskora Local Environment Ready!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo ""
        echo -e "  ${BLUE}Frontend:${NC}          http://localhost:3000"
        echo -e "  ${BLUE}Backend API:${NC}       http://localhost:8000"
        echo -e "  ${BLUE}API Docs:${NC}          http://localhost:8000/docs"
        echo -e "  ${BLUE}Health Check:${NC}      http://localhost:8000/health"
        echo -e "  ${BLUE}Redpanda Console:${NC}  http://localhost:8080"
        echo -e "  ${BLUE}Kafka Broker:${NC}      localhost:9092"
        echo -e "  ${BLUE}Redis:${NC}             localhost:6379"
        echo ""
        echo -e "  ${YELLOW}Dapr Sidecars:${NC}"
        echo -e "    Backend:  http://localhost:3500 (via backend network)"
        echo -e "    Frontend: http://localhost:3501 (via frontend network)"
        echo ""
        echo -e "  ${YELLOW}View logs:${NC}"
        echo -e "    docker compose -f docker-compose.yml -f docker-compose.dapr.yml logs -f"
        echo ""

    else
        echo -e "${YELLOW}Mode: Lightweight (no Dapr)${NC}"
        echo ""

        # Build and start base compose
        docker compose up -d --build

        echo ""
        echo -e "${BLUE}Waiting for services to be ready...${NC}"

        # Wait for backend
        wait_for_health "Backend" "http://localhost:8000/health" 60

        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}   Taskora Local Environment Ready!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo ""
        echo -e "  ${BLUE}Frontend:${NC}          http://localhost:3000"
        echo -e "  ${BLUE}Backend API:${NC}       http://localhost:8000"
        echo -e "  ${BLUE}API Docs:${NC}          http://localhost:8000/docs"
        echo -e "  ${BLUE}Health Check:${NC}      http://localhost:8000/health"
        echo -e "  ${BLUE}Redis:${NC}             localhost:6379"
        echo ""
        echo -e "  ${YELLOW}Note:${NC} Dapr/Redpanda not running. Use --with-dapr for full stack."
        echo ""
        echo -e "  ${YELLOW}View logs:${NC}"
        echo -e "    docker compose logs -f"
        echo ""
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}   Taskora Local Development${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""

    if [ "$CLEAN" = true ]; then
        clean_up
        exit 0
    fi

    if [ "$STOP" = true ]; then
        stop_services
        exit 0
    fi

    check_prerequisites
    start_services
}

main
