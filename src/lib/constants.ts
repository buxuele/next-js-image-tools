// Application constants

// File upload limits
export const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB
export const MAX_FILES_MULTI_MERGE = 6;
export const MIN_FILES_MULTI_MERGE = 2;

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

// Layout configurations for multi-merge
export const MERGE_LAYOUTS = {
  2: { type: "horizontal" as const, rows: 1, cols: 2 },
  3: { type: "vertical" as const, rows: 3, cols: 1 },
  4: { type: "grid" as const, rows: 2, cols: 2 },
  5: { type: "grid" as const, rows: 2, cols: 3 },
  6: { type: "grid" as const, rows: 2, cols: 3 },
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
  { href: "/", label: "双图合并", key: "dual-merge" },
  { href: "/multi-merge", label: "多图合并", key: "multi-merge" },
  { href: "/icon-maker", label: "图标制作", key: "icon-maker" },
  { href: "/file-diff", label: "文件对比", key: "file-diff" },
];
