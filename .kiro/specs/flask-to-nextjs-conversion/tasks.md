# Implementation Plan

- [x] 1. Set up Next.js project foundation and core infrastructure

  - Initialize Next.js 14 project with TypeScript and App Router
  - Configure project structure with src/ directory and proper folder organization
  - Install and configure essential dependencies (Sharp, Formidable, etc.)
  - Set up global styles with Bootstrap 5 CDN integration
  - _Requirements: 5.1, 5.5, 7.1_

- [x] 2. Create core UI components and layout system

  - [x] 2.1 Implement root layout with navigation component

    - Create app/layout.tsx with consistent navigation bar
    - Implement Navigation component with active state management
    - Add Bootstrap navbar styling matching Flask implementation exactly
    - _Requirements: 5.1, 5.2, 7.1_

  - [x] 2.2 Build flash message notification system

    - Create FlashMessage context and provider
    - Implement toast notifications with positioning and animations
    - Add auto-dismiss functionality and manual close buttons
    - Style messages to match Flask flash message appearance
    - _Requirements: 5.3, 5.6, 7.5_

  - [x] 2.3 Create reusable FileUpload component

    - Build custom file upload component with drag-and-drop styling
    - Implement file validation (type, size, count)
    - Add visual feedback for file selection and validation errors
    - Style to match Flask custom file upload appearance
    - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.4, 7.3_

- [x] 3. Implement dual image merge functionality

  - [x] 3.1 Create dual merge page component

    - Build DualMerge component with form handling
    - Implement file selection with exactly 2 image validation
    - Add checkbox for optional text labels
    - Create download button with proper state management
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 3.2 Build dual merge API endpoint

    - Create /api/merge/route.ts with POST handler
    - Implement file upload processing with Formidable
    - Add image validation and error handling
    - Process images with Sharp: resize to same height and merge horizontally
    - Add optional text labels ("修改前", "修改后") when requested
    - Return base64 encoded result for display
    - _Requirements: 1.3, 1.4, 1.6, 6.1, 6.2, 6.7_

- [x] 4. Implement multi-image merge functionality

  - [x] 4.1 Create multi-merge page component

    - Build MultiMerge component supporting 2-6 images
    - Implement file selection with count validation
    - Add filename sorting display and sequence number option
    - Create result display and download functionality
    - _Requirements: 2.1, 2.2, 2.7, 2.8_

  - [x] 4.2 Build multi-merge API endpoint
    - Create /api/multi-merge/route.ts with POST handler
    - Implement file count validation (2-6 images)
    - Add alphabetical filename sorting logic
    - Implement layout logic: 2=horizontal, 3=vertical, 4=2x2 grid, 5-6=2x3 grid
    - Process images with Sharp using appropriate merge algorithms
    - Add optional sequence numbering when requested
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.9, 6.1, 6.2_

- [ ] 5. Implement icon maker with visual cropping

  - [x] 5.1 Create icon maker page component

    - Build IconMaker component with image upload
    - Implement image display with overlay container
    - Add real-time preview canvas with 300x300 display
    - Create generate and download button functionality
    - _Requirements: 3.1, 3.2, 3.6, 3.7_

  - [x] 5.2 Build visual cropping overlay component

    - Create CropOverlay component with square selection area
    - Implement draggable crop selection with boundary constraints
    - Add corner resize handles maintaining square proportions
    - Implement mouse event handlers for drag and resize operations
    - Update preview canvas in real-time during crop adjustments
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [x] 5.3 Build icon generation API endpoint

    - Create /api/icon-maker/route.ts with POST handler
    - Process crop parameters and validate input bounds
    - Use Sharp to crop image to specified square region
    - Generate PNG format with optimization
    - Generate ICO format at 128x128 resolution
    - Return both formats as base64 for download

    - _Requirements: 3.7, 3.8, 6.1, 6.2, 6.7_

- [x] 6. Implement file comparison functionality

  - [x] 6.1 Create file diff page component

    - Build FileDiff component with dual file upload
    - Implement file selection validation (exactly 2 files)
    - Add loading state during processing
    - Display formatted diff results in table layout
    - _Requirements: 4.1, 4.2, 4.5, 4.8_

  - [x] 6.2 Build file diff API endpoint
    - Create /api/file-diff/route.ts with POST handler
    - Process uploaded text files with proper encoding detection
    - Implement diff algorithm matching Python difflib.HtmlDiff
    - Generate HTML diff with proper styling classes
    - Add syntax highlighting for additions, deletions, and changes
    - _Requirements: 4.3, 4.4, 4.6, 4.7, 6.1, 6.4_

- [ ] 7. Add comprehensive error handling and validation

  - [x] 7.1 Implement client-side validation

    - Add file type validation for all upload components
    - Implement file size validation (64MB limit)
    - Create user-friendly validation error messages
    - Add form validation with immediate feedback
    - _Requirements: 1.6, 2.9, 3.9, 4.8, 5.6, 6.5_

  - [x] 7.2 Implement server-side error handling
    - Create custom error classes for different error types
    - Add comprehensive error handling in all API routes
    - Implement proper HTTP status codes and error responses
    - Add logging for debugging and monitoring
    - Ensure proper cleanup of temporary files
    - _Requirements: 6.4, 6.6, 6.7_

- [x] 8. Style matching and responsive design

  - [x] 8.1 Implement exact visual styling

    - Match Bootstrap 5 styling and customizations exactly
    - Implement custom CSS for file upload components
    - Add card layouts and spacing matching Flask version
    - Ensure button styles, hover effects, and transitions match
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.7_

  - [x] 8.2 Ensure responsive design compatibility
    - Test and adjust mobile responsiveness
    - Maintain same breakpoints and responsive behavior
    - Ensure flash message positioning works on all screen sizes
    - Verify icon maker cropping interface works on mobile
    - _Requirements: 5.5, 7.6_

- [ ] 9. Testing and quality assurance

  - [ ] 9.1 Write unit tests for components (IN PROGRESS)

    - Test all React components with React Testing Library
    - Test image processing utilities and validation functions
    - Test API routes with mock data and edge cases
    - Ensure error handling paths are properly tested
    - _Requirements: All requirements validation_
    - _Note: Basic test structure created, Jest config needs fixing_

  - [ ] 9.2 Perform integration testing
    - Test complete file upload workflows end-to-end
    - Verify image processing results match Flask output
    - Test cross-browser compatibility
    - Validate responsive design on different devices
    - Test file size limits and error scenarios
    - _Requirements: All requirements validation_

- [x] 10. Performance optimization and deployment preparation

  - [x] 10.1 Optimize application performance

    - Implement code splitting and lazy loading where appropriate
    - Optimize image processing performance with Sharp
    - Add proper caching headers for static assets
    - Minimize bundle size and optimize build output
    - _Requirements: 6.5, 6.6_

  - [x] 10.2 Prepare for deployment
    - Configure production build settings
    - Set up environment variables and configuration
    - Add proper error monitoring and logging
    - Create deployment documentation and scripts
    - _Requirements: 6.4, 6.5, 6.6_
