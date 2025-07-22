// Performance optimization utilities

// Image processing optimization
export const SHARP_OPTIMIZATION_CONFIG = {
  // PNG optimization
  png: {
    quality: 90,
    compressionLevel: 6,
    progressive: false,
  },

  // JPEG optimization
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true,
  },

  // WebP optimization
  webp: {
    quality: 80,
    effort: 4,
  },

  // General resize options
  resize: {
    kernel: "lanczos3" as const,
    withoutEnlargement: true,
    fastShrinkOnLoad: true,
  },
};

// Memory management for large image processing
export const MEMORY_LIMITS = {
  MAX_CONCURRENT_OPERATIONS: 3,
  MAX_IMAGE_DIMENSION: 4096,
  MAX_TOTAL_PIXELS: 16777216, // 4096 * 4096
};

// File size optimization thresholds
export const SIZE_THRESHOLDS = {
  SMALL_IMAGE: 1024 * 1024, // 1MB
  MEDIUM_IMAGE: 5 * 1024 * 1024, // 5MB
  LARGE_IMAGE: 20 * 1024 * 1024, // 20MB
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;

    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};

    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
      };
    }

    return result;
  }
}

// Image processing queue for managing concurrent operations
export class ImageProcessingQueue {
  private static instance: ImageProcessingQueue;
  private queue: Array<() => Promise<unknown>> = [];
  private running = 0;

  static getInstance(): ImageProcessingQueue {
    if (!ImageProcessingQueue.instance) {
      ImageProcessingQueue.instance = new ImageProcessingQueue();
    }
    return ImageProcessingQueue.instance;
  }

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (
      this.running >= MEMORY_LIMITS.MAX_CONCURRENT_OPERATIONS ||
      this.queue.length === 0
    ) {
      return;
    }

    this.running++;
    const operation = this.queue.shift()!;

    try {
      await operation();
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage(): NodeJS.MemoryUsage | null {
  if (typeof process !== "undefined" && process.memoryUsage) {
    return process.memoryUsage();
  }
  return null;
}

// Image dimension validation for performance
export function validateImageDimensions(
  width: number,
  height: number
): boolean {
  if (
    width > MEMORY_LIMITS.MAX_IMAGE_DIMENSION ||
    height > MEMORY_LIMITS.MAX_IMAGE_DIMENSION
  ) {
    return false;
  }

  if (width * height > MEMORY_LIMITS.MAX_TOTAL_PIXELS) {
    return false;
  }

  return true;
}

// Optimize Sharp operations based on image size
export function getOptimalSharpConfig(fileSize: number) {
  if (fileSize <= SIZE_THRESHOLDS.SMALL_IMAGE) {
    return {
      ...SHARP_OPTIMIZATION_CONFIG,
      png: { ...SHARP_OPTIMIZATION_CONFIG.png, compressionLevel: 9 },
      jpeg: { ...SHARP_OPTIMIZATION_CONFIG.jpeg, quality: 90 },
    };
  } else if (fileSize <= SIZE_THRESHOLDS.MEDIUM_IMAGE) {
    return SHARP_OPTIMIZATION_CONFIG;
  } else {
    return {
      ...SHARP_OPTIMIZATION_CONFIG,
      png: { ...SHARP_OPTIMIZATION_CONFIG.png, compressionLevel: 3 },
      jpeg: { ...SHARP_OPTIMIZATION_CONFIG.jpeg, quality: 75 },
    };
  }
}
