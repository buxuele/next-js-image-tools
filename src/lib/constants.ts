// Application constants

// File upload limits
export const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB
export const MAX_FILES_IMAGE_MERGE = 6;
export const MIN_FILES_IMAGE_MERGE = 2;

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
];

// Text labels for dual merge
export const DUAL_MERGE_LABELS = {
  BEFORE: "修改前",
  AFTER: "修改后",
};

// Merge direction options
export const MERGE_DIRECTIONS = {
  HORIZONTAL: "horizontal" as const,
  VERTICAL: "vertical" as const,
  GRID: "grid" as const,
};

// Grid layout configurations for different image counts
export const GRID_LAYOUTS = {
  2: { rows: 1, cols: 2 },
  3: { rows: 2, cols: 2 }, // 2x2 with 1 empty
  4: { rows: 2, cols: 2 },
  5: { rows: 2, cols: 3 }, // 2x3 with 1 empty
  6: { rows: 2, cols: 3 },
};

// Icon maker settings
export const ICON_SETTINGS = {
  PREVIEW_SIZE: 300,
  ICO_SIZE: 128,
  DEFAULT_CROP_SIZE: 200,
};

// Flash message types
export const FLASH_MESSAGE_TYPES = {
  SUCCESS: "success" as const,
  ERROR: "error" as const,
  INFO: "info" as const,
};

// Navigation items
export const NAV_ITEMS = [
  { href: "/", label: "图片拼接", key: "image-merge" },
  { href: "/icon-maker", label: "图标制作", key: "icon-maker" },
  { href: "/file-diff", label: "文件对比", key: "file-diff" },
];
