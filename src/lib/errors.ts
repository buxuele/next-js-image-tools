// Custom error classes for different error types

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class FileProcessingError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "FileProcessingError";
  }
}

export class FileSizeError extends Error {
  constructor(
    message: string,
    public maxSize: number,
    public actualSize: number
  ) {
    super(message);
    this.name = "FileSizeError";
  }
}

export class FileTypeError extends Error {
  constructor(
    message: string,
    public allowedTypes: string[],
    public actualType: string
  ) {
    super(message);
    this.name = "FileTypeError";
  }
}

export class ImageProcessingError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export class CropParameterError extends Error {
  constructor(message: string, public parameters: Record<string, unknown>) {
    super(message);
    this.name = "CropParameterError";
  }
}

// Error response helper
export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export function createErrorResponse(
  error: Error | string,
  details?: Record<string, unknown>
): ErrorResponse {
  const message = typeof error === "string" ? error : error.message;

  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
}

// Logging helper
export function logError(
  context: string,
  error: Error | string,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const message = typeof error === "string" ? error : error.message;

  console.error(`[${timestamp}] ${context}: ${message}`);

  if (typeof error === "object" && error.stack) {
    console.error("Stack trace:", error.stack);
  }

  if (details) {
    console.error("Details:", details);
  }
}

// HTTP status code mapping
export function getHttpStatusForError(error: Error): number {
  switch (error.name) {
    case "ValidationError":
    case "FileSizeError":
    case "FileTypeError":
    case "CropParameterError":
      return 400; // Bad Request
    case "FileProcessingError":
    case "ImageProcessingError":
      return 422; // Unprocessable Entity
    default:
      return 500; // Internal Server Error
  }
}

// Safe error handler for API routes
export function handleApiError(
  context: string,
  error: unknown
): { response: ErrorResponse; status: number } {
  let processedError: Error;

  if (error instanceof Error) {
    processedError = error;
  } else if (typeof error === "string") {
    processedError = new Error(error);
  } else {
    processedError = new Error("Unknown error occurred");
  }

  logError(context, processedError);

  const status = getHttpStatusForError(processedError);
  const response = createErrorResponse(processedError);

  return { response, status };
}

// Cleanup helper for temporary files
export async function cleanupTempFiles(files: string[]) {
  // In a real implementation, you might want to clean up temporary files
  // For now, we'll just log the cleanup attempt
  if (files.length > 0) {
    console.log(`Cleaning up ${files.length} temporary files:`, files);
  }
}
