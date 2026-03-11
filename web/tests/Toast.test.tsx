import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/Toast";

// テスト用のトリガーコンポーネント
function TestTrigger({ message, type }: { message: string; type?: "success" | "error" | "info" }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, type)}>trigger</button>;
}

describe("ToastProvider", () => {
  it("renders children", () => {
    render(
      <ToastProvider>
        <p>Hello</p>
      </ToastProvider>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows toast message when triggered", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestTrigger message="投稿しました" type="success" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("投稿しました")).toBeInTheDocument();
    // 成功時は ✓ アイコン
    expect(screen.getByText("✓")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows error toast with correct icon", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestTrigger message="エラー発生" type="error" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("エラー発生")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("removes toast when close button clicked", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestTrigger message="閉じるテスト" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("閉じるテスト")).toBeInTheDocument();

    fireEvent.click(screen.getByText("×"));
    // アニメーション後に消える（300ms）
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByText("閉じるテスト")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("auto-removes toast after 3 seconds", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestTrigger message="自動消去" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("自動消去")).toBeInTheDocument();

    // 3s + 300ms animation
    act(() => { vi.advanceTimersByTime(3400); });
    expect(screen.queryByText("自動消去")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
