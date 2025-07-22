#!/bin/bash

# Development environment setup script

set -e

echo "🛠️  Setting up development environment..."

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

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✅"

# Check npm version
print_status "npm version: $(npm -v)"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Development environment variables
NODE_ENV=development
MAX_FILE_SIZE=67108864
MAX_CONCURRENT_OPERATIONS=3
NEXT_TELEMETRY_DISABLED=1
EOF
    print_status ".env.local created with default values"
else
    print_status ".env.local already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p public/uploads
mkdir -p .next
mkdir -p coverage

# Set up Git hooks (if Git is available)
if command -v git &> /dev/null && [ -d .git ]; then
    print_status "Setting up Git hooks..."
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run type checking
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_status "Git pre-commit hook installed"
fi

# Run initial build to check everything works
print_status "Running initial build check..."
npm run build

if [ $? -eq 0 ]; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed. Please check the errors above."
    exit 1
fi

# Clean up build files for development
rm -rf .next

print_status "🎉 Development environment setup completed!"
print_status ""
print_status "Available commands:"
print_status "  npm run dev          - Start development server"
print_status "  npm run build        - Build for production"
print_status "  npm run start        - Start production server"
print_status "  npm run lint         - Run ESLint"
print_status "  npm run test         - Run tests"
print_status "  npm run test:watch   - Run tests in watch mode"
print_status ""
print_status "To start development:"
print_status "  npm run dev"
print_status ""
print_status "The application will be available at http://localhost:3000"