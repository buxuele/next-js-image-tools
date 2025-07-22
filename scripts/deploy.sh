#!/bin/bash

# Deployment script for Next.js Image Tools

set -e

echo "🚀 Starting deployment process..."

# Configuration
APP_NAME="next-js-image-tools"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the application
print_status "Building Next.js application..."
npm run build

# Build Docker image
print_status "Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Stop existing container if running
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Run new container
print_status "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e MAX_FILE_SIZE=67108864 \
    -e MAX_CONCURRENT_OPERATIONS=3 \
    --restart unless-stopped \
    $DOCKER_IMAGE

# Wait for container to be ready
print_status "Waiting for application to start..."
sleep 10

# Health check
print_status "Performing health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "✅ Deployment successful! Application is running at http://localhost:3000"
else
    print_error "❌ Health check failed. Please check the logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Show container status
print_status "Container status:"
docker ps -f name=$CONTAINER_NAME

print_status "🎉 Deployment completed successfully!"
print_status "You can view logs with: docker logs -f $CONTAINER_NAME"
print_status "To stop the application: docker stop $CONTAINER_NAME"