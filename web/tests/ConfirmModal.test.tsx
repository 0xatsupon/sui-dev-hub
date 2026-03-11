import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConfirmModal } from "@/components/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal open={false} title="Test" message="msg" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmModal open={true} title="削除確認" message="本当に削除しますか？" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("削除確認")).toBeInTheDocument();
    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal open={true} title="T" message="M" confirmLabel="OK" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} title="T" message="M" cancelLabel="やめる" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("やめる"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel on Escape key", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} title="T" message="M" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("has correct ARIA attributes", () => {
    render(
      <ConfirmModal open={true} title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "confirm-modal-title");
  });

  it("applies destructive styling when destructive prop is true", () => {
    render(
      <ConfirmModal open={true} title="T" message="M" confirmLabel="削除" destructive onConfirm={() => {}} onCancel={() => {}} />
    );
    const confirmBtn = screen.getByText("削除");
    expect(confirmBtn.className).toContain("bg-red-600");
  });
});
