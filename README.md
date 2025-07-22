# Next.js Image Tools

A modern web application for image processing tasks including dual image merging, multi-image merging, icon creation, and file comparison. Built with Next.js 14, TypeScript, and Sharp for high-performance image processing.

## Features

- **双图合并 (Dual Image Merge)**: Merge two images horizontally with optional text labels
- **多图合并 (Multi Image Merge)**: Merge 2-6 images in intelligent layouts (horizontal, vertical, grid)
- **图标制作 (Icon Maker)**: Create PNG and ICO icons with visual cropping interface
- **文件对比 (File Diff)**: Compare text files with syntax highlighting

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Bootstrap 5, Custom CSS
- **Image Processing**: Sharp
- **File Handling**: Formidable
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, Nginx

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (for deployment)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd next-js-image-tools
   ```

2. **Run setup script**

   ```bash
   chmod +x scripts/dev-setup.sh
   ./scripts/dev-setup.sh
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── file-diff/         # File comparison page
│   ├── icon-maker/        # Icon creation page
│   ├── multi-merge/       # Multi-image merge page
│   └── page.tsx           # Home page (dual merge)
├── components/            # React components
│   ├── image/            # Image-related components
│   └── ui/               # UI components
└── lib/                  # Utility libraries
    ├── constants.ts      # Application constants
    ├── errors.ts         # Error handling
    ├── file-utils.ts     # File utilities
    ├── performance.ts    # Performance optimization
    ├── types.ts          # TypeScript types
    └── validation.ts     # Input validation
```

## API Endpoints

- `POST /api/merge` - Dual image merge
- `POST /api/multi-merge` - Multi-image merge
- `POST /api/icon-maker` - Icon generation
- `POST /api/file-diff` - File comparison
- `GET /api/health` - Health check

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NODE_ENV=development
MAX_FILE_SIZE=67108864          # 64MB
MAX_CONCURRENT_OPERATIONS=3
NEXT_TELEMETRY_DISABLED=1
```

### File Upload Limits

- Maximum file size: 64MB per file
- Supported image formats: PNG, JPG, JPEG, GIF, WebP
- Maximum concurrent operations: 3

## Deployment

### Docker Deployment

1. **Build and deploy**

   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

2. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Nginx Configuration

The included `nginx.conf` provides:

- Rate limiting for API endpoints
- File upload optimization
- Gzip compression
- Security headers
- SSL/HTTPS support (commented out)

## Performance Optimization

- **Image Processing**: Optimized Sharp configurations based on file size
- **Memory Management**: Concurrent operation limits and memory monitoring
- **Caching**: Static asset caching and CDN-ready headers
- **Compression**: Gzip compression for text assets
- **Code Splitting**: Automatic vendor and library splitting

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security Features

- File type validation
- File size limits
- Input sanitization
- XSS protection headers
- CSRF protection
- Rate limiting

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages

## Changelog

### v1.0.0

- Initial release
- Dual image merge functionality
- Multi-image merge with intelligent layouts
- Icon maker with visual cropping
- File comparison with syntax highlighting
- Docker deployment support
- Comprehensive error handling
- Performance optimizations
