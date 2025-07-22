import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  drawImage: jest.fn(),
}));

// Mock file reader
global.FileReader = class {
  readAsDataURL = jest.fn();
  result = "data:image/png;base64,mock-data";
  onload = null;
};
