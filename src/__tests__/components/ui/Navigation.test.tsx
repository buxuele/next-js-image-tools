import { render, screen } from "@testing-library/react";
import Navigation from "@/components/ui/Navigation";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/");
  });

  it("renders navigation brand", () => {
    render(<Navigation />);

    expect(screen.getByText("图像处理工具")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(<Navigation />);

    expect(screen.getByText("图片拼接")).toBeInTheDocument();
    expect(screen.getByText("图标制作")).toBeInTheDocument();
    expect(screen.getByText("文件对比")).toBeInTheDocument();
  });

  it("applies active class to current page", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/");

    render(<Navigation />);

    const imageMergeLink = screen.getByText("图片拼接").closest("a");
    expect(imageMergeLink).toHaveClass("nav-link", "px-3", "active");
  });

  it("does not apply active class to non-current pages", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/icon-maker");

    render(<Navigation />);

    const imageMergeLink = screen.getByText("图片拼接").closest("a");
    expect(imageMergeLink).not.toHaveClass("active");
  });

  it("has correct href attributes", () => {
    render(<Navigation />);

    expect(screen.getByText("图片拼接").closest("a")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("图标制作").closest("a")).toHaveAttribute(
      "href",
      "/icon-maker"
    );
    expect(screen.getByText("文件对比").closest("a")).toHaveAttribute(
      "href",
      "/file-diff"
    );
  });
});
