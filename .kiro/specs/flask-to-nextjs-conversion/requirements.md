# Requirements Document

## Introduction

This project involves converting an existing Flask web application to Next.js while maintaining identical UI and functionality. The Flask app is a utility tool collection that provides image processing capabilities including dual image merging, multi-image merging, icon creation with visual cropping, and file comparison features. The conversion must preserve all existing features, styling, and user experience while leveraging Next.js architecture and modern React patterns.

## Requirements

### Requirement 1

**User Story:** As a user, I want to access a dual image merging tool, so that I can combine two images side by side with optional text labels.

#### Acceptance Criteria

1. WHEN I navigate to the home page THEN the system SHALL display the dual image merge interface
2. WHEN I select exactly two image files THEN the system SHALL accept PNG, JPG, JPEG, GIF, and WEBP formats
3. WHEN I upload two images THEN the system SHALL resize them to the same height and merge them horizontally
4. WHEN I check the "add text" option THEN the system SHALL add "修改前" and "修改后" labels to the respective images
5. WHEN the merge is complete THEN the system SHALL display the merged image and provide a download option
6. IF I select incorrect number of files THEN the system SHALL display appropriate error messages

### Requirement 2

**User Story:** As a user, I want to merge multiple images (2-6), so that I can create composite images with different layout arrangements.

#### Acceptance Criteria

1. WHEN I navigate to the multi-merge page THEN the system SHALL display the multi-image merge interface
2. WHEN I select 2-6 image files THEN the system SHALL accept the same image formats as dual merge
3. WHEN I upload 2 images THEN the system SHALL arrange them horizontally
4. WHEN I upload 3 images THEN the system SHALL arrange them vertically
5. WHEN I upload 4 images THEN the system SHALL arrange them in a 2×2 grid
6. WHEN I upload 5-6 images THEN the system SHALL arrange them in a 2×3 grid
7. WHEN files are uploaded THEN the system SHALL sort them alphabetically by filename
8. WHEN I check "add sequence numbers" THEN the system SHALL add numbered labels to each image
9. IF I select incorrect number of files THEN the system SHALL display validation errors

### Requirement 3

**User Story:** As a user, I want to create icons from images with visual cropping, so that I can generate PNG and ICO files from selected image regions.

#### Acceptance Criteria

1. WHEN I navigate to the icon maker page THEN the system SHALL display the icon creation interface
2. WHEN I upload an image THEN the system SHALL display it with a visual cropping overlay
3. WHEN the image loads THEN the system SHALL show a square cropping selection with resize handles
4. WHEN I drag the crop selection THEN the system SHALL move the cropping area within image boundaries
5. WHEN I drag resize handles THEN the system SHALL maintain square proportions and update the crop area
6. WHEN I adjust the crop area THEN the system SHALL update the preview in real-time
7. WHEN I click generate THEN the system SHALL create both PNG and ICO files and trigger downloads
8. WHEN generation is complete THEN the system SHALL display success notification
9. IF image processing fails THEN the system SHALL display appropriate error messages

### Requirement 4

**User Story:** As a user, I want to compare two text files, so that I can see differences between file versions with highlighted changes.

#### Acceptance Criteria

1. WHEN I navigate to the file diff page THEN the system SHALL display the file comparison interface
2. WHEN I select exactly two files THEN the system SHALL accept text-based file formats
3. WHEN I submit files for comparison THEN the system SHALL generate an HTML diff view
4. WHEN the diff is generated THEN the system SHALL highlight additions in green, deletions in red, and changes in yellow
5. WHEN processing files THEN the system SHALL show loading indicators
6. WHEN comparison is complete THEN the system SHALL display the diff in a formatted table view
7. IF file processing fails THEN the system SHALL display error messages
8. IF incorrect number of files selected THEN the system SHALL show validation errors

### Requirement 5

**User Story:** As a user, I want consistent navigation and UI experience, so that I can easily switch between different tools.

#### Acceptance Criteria

1. WHEN I access any page THEN the system SHALL display a consistent navigation bar with all tool links
2. WHEN I'm on a specific page THEN the system SHALL highlight the active navigation item
3. WHEN operations complete THEN the system SHALL display flash messages with appropriate styling
4. WHEN I interact with forms THEN the system SHALL provide visual feedback for file selection and validation
5. WHEN I use the application THEN the system SHALL maintain responsive design across different screen sizes
6. WHEN errors occur THEN the system SHALL display user-friendly error messages
7. WHEN I perform actions THEN the system SHALL provide loading states and progress indicators

### Requirement 6

**User Story:** As a developer, I want the Next.js application to handle file uploads and image processing, so that server-side functionality matches the original Flask implementation.

#### Acceptance Criteria

1. WHEN files are uploaded THEN the system SHALL handle multipart form data processing
2. WHEN images are processed THEN the system SHALL use appropriate image manipulation libraries
3. WHEN files are generated THEN the system SHALL provide proper download mechanisms
4. WHEN errors occur THEN the system SHALL implement proper error handling and logging
5. WHEN processing large files THEN the system SHALL respect file size limits (64MB)
6. WHEN temporary files are created THEN the system SHALL properly clean up resources
7. WHEN API endpoints are called THEN the system SHALL return appropriate HTTP status codes and responses

### Requirement 7

**User Story:** As a user, I want the application to maintain the exact same visual appearance, so that the transition from Flask to Next.js is seamless.

#### Acceptance Criteria

1. WHEN I view any page THEN the system SHALL use identical Bootstrap 5 styling and layout
2. WHEN I interact with components THEN the system SHALL maintain the same color scheme and visual effects
3. WHEN I upload files THEN the system SHALL display the same custom file upload styling
4. WHEN I view results THEN the system SHALL use identical card layouts and spacing
5. WHEN I see flash messages THEN the system SHALL display them with the same positioning and animations
6. WHEN I use mobile devices THEN the system SHALL maintain the same responsive behavior
7. WHEN I interact with buttons THEN the system SHALL preserve hover effects and transitions
