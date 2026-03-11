import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReadingProgress } from "@/components/ReadingProgress";

describe("ReadingProgress", () => {
  it("renders nothing when not scrolled (progress=0)", () => {
    const { container } = render(<ReadingProgress />);
    // progress <= 0 なので null を返す
    expect(container.innerHTML).toBe("");
  });

  it("registers and cleans up scroll listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<ReadingProgress />);

    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
