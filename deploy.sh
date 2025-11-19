#!/bin/bash

# Chain of Custody - Deployment Script
# This script helps deploy and manage the Chain of Custody PoC system

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Chain of Custody - Tamper-Proof Sign-Off          ║
║              Deployment & Management Script               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    print_success "Docker found"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose found"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker daemon running"

    # Check ports
    print_info "Checking port availability..."
    for port in 3000 5000 27017; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
        else
            print_success "Port $port available"
        fi
    done
}

# Function to start the system
start_system() {
    print_info "Starting Chain of Custody system..."

    docker-compose up --build -d

    print_success "Containers started!"
    print_info "Waiting for services to initialize (30 seconds)..."

    # Wait for services to be ready
    sleep 10

    # Check health
    for i in {1..10}; do
        if curl -s http://localhost:5000/health > /dev/null 2>&1; then
            print_success "Backend is ready!"
            break
        fi
        if [ $i -eq 10 ]; then
            print_warning "Backend may still be starting..."
        fi
        sleep 2
    done

    echo ""
    print_success "System started successfully!"
    echo ""
    echo -e "${GREEN}📍 Access URLs:${NC}"
    echo "   Frontend:     http://localhost:3000"
    echo "   Backend:      http://localhost:5000"
    echo "   Health Check: http://localhost:5000/health"
    echo ""
    print_warning "IMPORTANT: Don't forget to request an airdrop!"
    echo "   Run: ./deploy.sh airdrop"
    echo ""
}

# Function to stop the system
stop_system() {
    print_info "Stopping Chain of Custody system..."
    docker-compose down
    print_success "System stopped"
}

# Function to restart the system
restart_system() {
    print_info "Restarting Chain of Custody system..."
    docker-compose restart
    print_success "System restarted"
}

# Function to view logs
view_logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        print_info "Showing logs for all services..."
        docker-compose logs -f
    else
        print_info "Showing logs for $service..."
        docker-compose logs -f $service
    fi
}

# Function to request airdrop
request_airdrop() {
    amount=${1:-2}
    print_info "Requesting airdrop of $amount SOL..."

    response=$(curl -s -X POST http://localhost:5000/request-airdrop \
        -H "Content-Type: application/json" \
        -d "{\"amount\": $amount}")

    if echo "$response" | grep -q "success"; then
        print_success "Airdrop successful!"
        echo "$response" | grep -o '"newBalance":"[^"]*"' | cut -d'"' -f4
    else
        print_error "Airdrop failed"
        echo "$response"
    fi
}

# Function to check status
check_status() {
    print_info "Checking system status..."
    echo ""

    # Docker containers
    echo -e "${BLUE}Docker Containers:${NC}"
    docker-compose ps
    echo ""

    # Health check
    echo -e "${BLUE}Backend Health:${NC}"
    curl -s http://localhost:5000/health | grep -o '"status":"[^"]*"' || print_error "Backend not responding"
    echo ""

    # Wallet info
    echo -e "${BLUE}Solana Wallet:${NC}"
    curl -s http://localhost:5000/wallet-info 2>/dev/null | grep -o '"balance":"[^"]*"' || print_warning "Cannot fetch wallet info"
    echo ""
}

# Function to clean everything
clean_system() {
    print_warning "This will remove all containers, volumes, and uploaded files!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning system..."
        docker-compose down -v
        rm -rf uploads/*
        rm -f wallet.json
        print_success "System cleaned"
    else
        print_info "Cancelled"
    fi
}

# Function to run tests
run_tests() {
    print_info "Running basic tests..."
    echo ""

    # Test 1: Health check
    echo -n "Test 1: Health Check... "
    if curl -s http://localhost:5000/health | grep -q "healthy"; then
        print_success "PASS"
    else
        print_error "FAIL"
    fi

    # Test 2: Wallet info
    echo -n "Test 2: Wallet Info... "
    if curl -s http://localhost:5000/wallet-info | grep -q "address"; then
        print_success "PASS"
    else
        print_error "FAIL"
    fi

    # Test 3: Get requests
    echo -n "Test 3: Get Requests... "
    if curl -s http://localhost:5000/requests | grep -q "\["; then
        print_success "PASS"
    else
        print_error "FAIL"
    fi

    echo ""
    print_info "Basic tests completed"
}

# Function to show help
show_help() {
    cat << EOF

Usage: ./deploy.sh [COMMAND] [OPTIONS]

Commands:
    start           Start the entire system
    stop            Stop all containers
    restart         Restart all containers
    status          Show system status
    logs [service]  Show logs (optionally for specific service)
    airdrop [amt]   Request SOL airdrop (default: 2 SOL)
    test            Run basic system tests
    clean           Remove all containers, volumes, and data
    help            Show this help message

Examples:
    ./deploy.sh start                Start the system
    ./deploy.sh airdrop 3            Request 3 SOL airdrop
    ./deploy.sh logs backend         Show backend logs
    ./deploy.sh status               Check system status

Services:
    - mongo          MongoDB database
    - backend        Node.js API server
    - frontend       React application

For detailed documentation, see:
    - README.md         Complete guide
    - QUICKSTART.md     5-minute setup
    - TESTING_GUIDE.md  Test scenarios

EOF
}

# Main script logic
case "${1:-}" in
    start)
        check_prerequisites
        start_system
        ;;
    stop)
        stop_system
        ;;
    restart)
        restart_system
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs "${2:-}"
        ;;
    airdrop)
        request_airdrop "${2:-2}"
        ;;
    test)
        run_tests
        ;;
    clean)
        clean_system
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo ""
        show_help
        exit 1
        ;;
esac
