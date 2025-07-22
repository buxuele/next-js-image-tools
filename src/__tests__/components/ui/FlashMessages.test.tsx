import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FlashMessageProvider,
  useFlashMessages,
} from "@/components/ui/FlashMessageProvider";
import FlashMessages from "@/components/ui/FlashMessages";

// Test component to trigger flash messages
function TestComponent() {
  const { addMessage } = useFlashMessages();

  return (
    <div>
      <button onClick={() => addMessage("success", "Success message")}>
        Add Success
      </button>
      <button onClick={() => addMessage("error", "Error message")}>
        Add Error
      </button>
      <button onClick={() => addMessage("info", "Info message")}>
        Add Info
      </button>
    </div>
  );
}

function TestApp() {
  return (
    <FlashMessageProvider>
      <FlashMessages />
      <TestComponent />
    </FlashMessageProvider>
  );
}

describe("FlashMessages Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("displays success message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Success"));

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Success message").closest(".alert")).toHaveClass(
      "alert-success"
    );
  });

  it("displays error message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Error"));

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message").closest(".alert")).toHaveClass(
      "alert-danger"
    );
  });

  it("displays info message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Info"));

    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("Info message").closest(".alert")).toHaveClass(
      "alert-info"
    );
  });

  it("auto-dismisses messages after timeout", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Success"));

    expect(screen.getByText("Success message")).toBeInTheDocument();

    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Success message")).not.toBeInTheDocument();
    });
  });

  it("allows manual dismissal of messages", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Success"));

    expect(screen.getByText("Success message")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(screen.queryByText("Success message")).not.toBeInTheDocument();
  });

  it("displays multiple messages", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TestApp />);

    await user.click(screen.getByText("Add Success"));
    await user.click(screen.getByText("Add Error"));

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("handles empty message list", () => {
    render(
      <FlashMessageProvider>
        <FlashMessages />
      </FlashMessageProvider>
    );

    // Should render without errors and show no messages
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
