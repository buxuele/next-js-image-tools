import {
  formatFileSize,
  sortFilesByName,
  createDownloadLink,
} from "@/lib/file-utils";

// Mock file creation helper
const createMockFile = (name: string, type: string = "image/png"): File => {
  return new File(["mock content"], name, { type });
};

describe("File Utils", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1048576)).toBe("1.0 MB");
      expect(formatFileSize(1073741824)).toBe("1.0 GB");
    });

    it("should handle zero bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("should handle very large numbers", () => {
      expect(formatFileSize(1099511627776)).toBe("1.0 TB");
    });
  });

  describe("sortFilesByName", () => {
    it("should sort files alphabetically by name", () => {
      const files = [
        createMockFile("zebra.png"),
        createMockFile("apple.png"),
        createMockFile("banana.png"),
      ];

      const sorted = sortFilesByName(files);

      expect(sorted[0].name).toBe("apple.png");
      expect(sorted[1].name).toBe("banana.png");
      expect(sorted[2].name).toBe("zebra.png");
    });

    it("should handle case-insensitive sorting", () => {
      const files = [
        createMockFile("Zebra.png"),
        createMockFile("apple.png"),
        createMockFile("Banana.png"),
      ];

      const sorted = sortFilesByName(files);

      expect(sorted[0].name).toBe("apple.png");
      expect(sorted[1].name).toBe("Banana.png");
      expect(sorted[2].name).toBe("Zebra.png");
    });

    it("should handle empty array", () => {
      const sorted = sortFilesByName([]);
      expect(sorted).toEqual([]);
    });

    it("should not mutate original array", () => {
      const files = [createMockFile("zebra.png"), createMockFile("apple.png")];
      const originalOrder = files.map((f) => f.name);

      sortFilesByName(files);

      expect(files.map((f) => f.name)).toEqual(originalOrder);
    });
  });

  describe("createDownloadLink", () => {
    let mockLink: HTMLAnchorElement;
    let mockClick: jest.Mock;
    let mockAppendChild: jest.Mock;
    let mockRemoveChild: jest.Mock;

    beforeEach(() => {
      mockClick = jest.fn();
      mockAppendChild = jest.fn();
      mockRemoveChild = jest.fn();

      mockLink = {
        href: "",
        download: "",
        click: mockClick,
      } as HTMLAnchorElement;

      // Mock document.createElement
      jest.spyOn(document, "createElement").mockReturnValue(mockLink);

      // Mock document.body methods
      Object.defineProperty(document, "body", {
        value: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
        writable: true,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create download link with correct attributes", () => {
      const base64Data =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const filename = "test.png";
      const mimeType = "image/png";

      createDownloadLink(base64Data, filename, mimeType);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.href).toBe(`data:${mimeType};base64,${base64Data}`);
      expect(mockLink.download).toBe(filename);
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it("should handle different file types", () => {
      const base64Data = "test-data";
      const filename = "document.pdf";
      const mimeType = "application/pdf";

      createDownloadLink(base64Data, filename, mimeType);

      expect(mockLink.href).toBe(`data:${mimeType};base64,${base64Data}`);
      expect(mockLink.download).toBe(filename);
    });
  });
});
