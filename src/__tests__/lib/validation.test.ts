import {
  validateImageFile,
  validateImageFiles,
  validateDualMergeFiles,
  validateMultiMergeFiles,
  validateImageMergeFiles,
  validateTextFiles,
  validateCropParameters,
} from "@/lib/validation";

// Mock file creation helper
const createMockFile = (
  name: string,
  type: string,
  size: number = 1024
): File => {
  const file = new File(["mock content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("Validation Functions", () => {
  describe("validateImageFile", () => {
    it("should validate a valid image file", () => {
      const file = createMockFile("test.png", "image/png");
      const result = validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject file that is too large", () => {
      const file = createMockFile("large.png", "image/png", 70 * 1024 * 1024); // 70MB
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("too large");
    });

    it("should reject unsupported file type", () => {
      const file = createMockFile("test.txt", "text/plain");
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("unsupported format");
    });
  });

  describe("validateImageFiles", () => {
    it("should validate multiple valid image files", () => {
      const files = [
        createMockFile("test1.png", "image/png"),
        createMockFile("test2.jpg", "image/jpeg"),
      ];
      const result = validateImageFiles(files);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty file array", () => {
      const result = validateImageFiles([]);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("select at least one file");
    });
  });

  describe("validateDualMergeFiles", () => {
    it("should validate exactly 2 image files", () => {
      const files = [
        createMockFile("test1.png", "image/png"),
        createMockFile("test2.jpg", "image/jpeg"),
      ];
      const result = validateDualMergeFiles(files);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject when not exactly 2 files", () => {
      const files = [createMockFile("test1.png", "image/png")];
      const result = validateDualMergeFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("exactly 2 images");
    });
  });

  describe("validateMultiMergeFiles", () => {
    it("should validate 3 image files", () => {
      const files = [
        createMockFile("test1.png", "image/png"),
        createMockFile("test2.jpg", "image/jpeg"),
        createMockFile("test3.gif", "image/gif"),
      ];
      const result = validateMultiMergeFiles(files);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject when less than 2 files", () => {
      const files = [createMockFile("test1.png", "image/png")];
      const result = validateMultiMergeFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("between 2 and 6 images");
    });

    it("should reject when more than 6 files", () => {
      const files = Array.from({ length: 7 }, (_, i) =>
        createMockFile(`test${i}.png`, "image/png")
      );
      const result = validateMultiMergeFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("between 2 and 6 images");
    });
  });

  describe("validateImageMergeFiles", () => {
    it("should validate 3 image files", () => {
      const files = [
        createMockFile("test1.png", "image/png"),
        createMockFile("test2.jpg", "image/jpeg"),
        createMockFile("test3.gif", "image/gif"),
      ];
      const result = validateImageMergeFiles(files);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject when less than 2 files", () => {
      const files = [createMockFile("test1.png", "image/png")];
      const result = validateImageMergeFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("请选择2到6张图片进行拼接");
    });

    it("should reject when more than 6 files", () => {
      const files = Array.from({ length: 7 }, (_, i) =>
        createMockFile(`test${i}.png`, "image/png")
      );
      const result = validateImageMergeFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("请选择2到6张图片进行拼接");
    });
  });

  describe("validateTextFiles", () => {
    it("should validate exactly 2 text files", () => {
      const files = [
        createMockFile("file1.txt", "text/plain"),
        createMockFile("file2.txt", "text/plain"),
      ];
      const result = validateTextFiles(files);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject when not exactly 2 files", () => {
      const files = [createMockFile("file1.txt", "text/plain")];
      const result = validateTextFiles(files);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("exactly 2 files");
    });
  });

  describe("validateCropParameters", () => {
    it("should validate valid crop parameters", () => {
      const result = validateCropParameters(10, 10, 100, 500, 400);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject negative position", () => {
      const result = validateCropParameters(-5, 10, 100, 500, 400);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("cannot be negative");
    });

    it("should reject zero or negative size", () => {
      const result = validateCropParameters(10, 10, 0, 500, 400);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("must be positive");
    });

    it("should reject crop area exceeding image boundaries", () => {
      const result = validateCropParameters(450, 10, 100, 500, 400);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("exceeds image boundaries");
    });
  });
});
