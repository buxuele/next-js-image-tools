# Design Document

## Overview

This design outlines the conversion of a Flask-based image processing utility application to Next.js while maintaining identical functionality and UI. The application will use Next.js 14 with App Router, React Server Components where appropriate, and modern image processing libraries to replicate the original Flask functionality.

## Architecture

### Application Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Home page (dual image merge)
│   ├── multi-merge/
│   │   └── page.tsx              # Multi-image merge page
│   ├── icon-maker/
│   │   └── page.tsx              # Icon creation page
│   ├── file-diff/
│   │   └── page.tsx              # File comparison page
│   └── api/
│       ├── merge/
│       │   └── route.ts          # Dual image merge API
│       ├── multi-merge/
│       │   └── route.ts          # Multi-image merge API
│       ├── icon-maker/
│       │   └── route.ts          # Icon generation API
│       └── file-diff/
│           └── route.ts          # File comparison API
├── components/
│   ├── ui/
│   │   ├── Navigation.tsx        # Main navigation component
│   │   ├── FlashMessage.tsx      # Toast notification system
│   │   ├── FileUpload.tsx        # Reusable file upload component
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   ├── image/
│   │   ├── DualMerge.tsx         # Dual image merge form
│   │   ├── MultiMerge.tsx        # Multi-image merge form
│   │   ├── IconMaker.tsx         # Icon creation interface
│   │   └── CropOverlay.tsx       # Visual cropping component
│   └── diff/
│       └── FileDiff.tsx          # File comparison interface
├── lib/
│   ├── image-processor.ts        # Image processing utilities
│   ├── file-utils.ts            # File handling utilities
│   ├── validation.ts            # Input validation
│   └── constants.ts             # Application constants
└── styles/
    └── globals.css              # Global styles and Bootstrap customizations
```

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Bootstrap 5 + Custom CSS (matching original)
- **Image Processing**: Sharp (server-side) + Canvas API (client-side)
- **File Handling**: Formidable for multipart uploads
- **State Management**: React useState/useReducer for local state
- **Notifications**: Custom toast system matching Flask flash messages

## Components and Interfaces

### Core Components

#### Navigation Component

```typescript
interface NavigationProps {
  currentPath: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  // Renders Bootstrap navbar with active state management
  // Matches original Flask navigation exactly
};
```

#### FlashMessage System

```typescript
interface FlashMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

interface FlashMessageContextType {
  messages: FlashMessage[];
  addMessage: (message: Omit<FlashMessage, "id">) => void;
  removeMessage: (id: string) => void;
}
```

#### FileUpload Component

```typescript
interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onValidationError: (error: string) => void;
  children: React.ReactNode;
}
```

#### CropOverlay Component

```typescript
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropOverlayProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onCropChange: (crop: CropArea) => void;
  initialCrop?: CropArea;
}
```

### API Route Interfaces

#### Image Processing APIs

```typescript
// /api/merge/route.ts
interface MergeRequest {
  images: File[];
  addText?: boolean;
}

interface MergeResponse {
  success: boolean;
  imageData?: string; // base64
  error?: string;
}

// /api/multi-merge/route.ts
interface MultiMergeRequest {
  images: File[];
  addText?: boolean;
}

// /api/icon-maker/route.ts
interface IconMakerRequest {
  image: File;
  cropX: number;
  cropY: number;
  cropSize: number;
  scale: number;
}

interface IconMakerResponse {
  success: boolean;
  pngData?: string;
  icoData?: string;
  pngFilename?: string;
  icoFilename?: string;
  error?: string;
}

// /api/file-diff/route.ts
interface FileDiffRequest {
  files: File[];
}

interface FileDiffResponse {
  success: boolean;
  diffHtml?: string;
  error?: string;
}
```

## Data Models

### Image Processing Models

```typescript
interface ImageDimensions {
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: Buffer;
  format: string;
  dimensions: ImageDimensions;
}

interface MergeLayout {
  type: "horizontal" | "vertical" | "grid";
  rows?: number;
  cols?: number;
}
```

### File Handling Models

```typescript
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Error Handling

### Client-Side Error Handling

- Form validation with immediate feedback
- File type and size validation before upload
- Network error handling with retry mechanisms
- User-friendly error messages matching Flask implementation

### Server-Side Error Handling

```typescript
class ImageProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

## Testing Strategy

### Unit Testing

- Component testing with React Testing Library
- API route testing with Jest
- Image processing utility testing
- Validation function testing

### Integration Testing

- End-to-end file upload workflows
- Image processing pipeline testing
- Cross-browser compatibility testing

### Performance Testing

- Large file upload handling
- Image processing performance benchmarks
- Memory usage optimization

## Security Considerations

### File Upload Security

- File type validation (whitelist approach)
- File size limits (64MB matching Flask)
- Filename sanitization
- Temporary file cleanup

### Image Processing Security

- Input validation for crop parameters
- Buffer overflow protection
- Resource usage limits

### API Security

- Request size limits
- Rate limiting considerations
- CSRF protection (built into Next.js)

## Performance Optimizations

### Image Processing

- Streaming file uploads
- Progressive image loading
- Client-side image preview optimization
- Server-side Sharp optimization

### Caching Strategy

- Static asset caching
- API response caching where appropriate
- Client-side result caching

### Bundle Optimization

- Code splitting by route
- Dynamic imports for heavy libraries
- Tree shaking for unused code

## Deployment Considerations

### Build Configuration

- Next.js production build optimization
- Environment variable configuration
- Static asset optimization

### Runtime Requirements

- Node.js version compatibility
- Memory requirements for image processing
- File system permissions for temporary files

### Monitoring

- Error tracking and logging
- Performance monitoring
- File upload success rates

## Migration Strategy

### Phase 1: Core Infrastructure

- Set up Next.js project structure
- Implement navigation and layout
- Create flash message system

### Phase 2: Image Processing Features

- Implement dual image merge
- Implement multi-image merge
- Implement icon maker with cropping

### Phase 3: File Comparison

- Implement file diff functionality
- Add syntax highlighting and formatting

### Phase 4: Polish and Testing

- Style matching and responsive design
- Comprehensive testing
- Performance optimization

## Styling Implementation

### Bootstrap Integration

- Use CDN links matching Flask version
- Custom CSS overrides for exact visual matching
- Responsive design preservation

### Component Styling

- CSS Modules for component-specific styles
- Global styles for Bootstrap customizations
- Animation and transition matching

### Theme Consistency

- Color scheme preservation
- Typography matching
- Spacing and layout consistency
