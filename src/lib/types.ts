// Type definitions for the application

export interface FlashMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CropParameters {
  x: number;
  y: number;
  size: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface MergeLayout {
  type: "horizontal" | "vertical" | "grid";
  rows: number;
  cols: number;
}

export type MergeDirection = "horizontal" | "vertical" | "grid";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  key: string;
}
