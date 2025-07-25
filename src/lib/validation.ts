import { SUPPORTED_IMAGE_FORMATS, MAX_FILE_SIZE } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File "${file.name}" is too large. Maximum size is 64MB.`);
  }

  // Check file type
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    errors.push(
      `File "${file.name}" has unsupported format. Supported formats: PNG, JPG, JPEG, GIF, WEBP.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateImageFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push("Please select at least one file.");
    return { isValid: false, errors };
  }

  // Validate each file
  for (const file of files) {
    const fileValidation = validateImageFile(file);
    errors.push(...fileValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDualMergeFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length !== 2) {
    errors.push("Please select exactly 2 images for dual merge.");
    return { isValid: false, errors };
  }

  const imageValidation = validateImageFiles(files);
  errors.push(...imageValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMultiMergeFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length < 2 || files.length > 6) {
    errors.push("Please select between 2 and 6 images for multi merge.");
    return { isValid: false, errors };
  }

  const imageValidation = validateImageFiles(files);
  errors.push(...imageValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateImageMergeFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length < 2 || files.length > 6) {
    errors.push("请选择2到6张图片进行拼接。");
    return { isValid: false, errors };
  }

  const imageValidation = validateImageFiles(files);
  errors.push(...imageValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTextFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length !== 2) {
    errors.push("Please select exactly 2 files for comparison.");
    return { isValid: false, errors };
  }

  // Check file size
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.name}" is too large. Maximum size is 64MB.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCropParameters(
  x: number,
  y: number,
  size: number,
  imageWidth: number,
  imageHeight: number
): ValidationResult {
  const errors: string[] = [];

  if (x < 0 || y < 0) {
    errors.push("Crop position cannot be negative.");
  }

  if (size <= 0) {
    errors.push("Crop size must be positive.");
  }

  if (x + size > imageWidth || y + size > imageHeight) {
    errors.push("Crop area exceeds image boundaries.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
