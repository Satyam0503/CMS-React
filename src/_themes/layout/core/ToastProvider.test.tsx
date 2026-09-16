import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "./ToastProvider";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const toastContainer = vi.fn(({ closeButton: CloseButton }: any) => (
  <div>
    <CloseButton closeToast={closeToast} ariaLabel="Dismiss notification" />
  </div>
));
const closeToast = vi.fn();

vi.mock("@mui/material", () => ({
  useColorScheme: () => ({ mode: "light", systemMode: "light" }),
}));

vi.mock("@mui/icons-material", () => ({
  CloseRounded: () => <span aria-hidden="true">×</span>,
}));

vi.mock("react-toastify", () => ({
  Slide: "slide",
  Zoom: "zoom",
  Flip: "flip",
  Bounce: "bounce",
  ToastContainer: (props: unknown) => toastContainer(props),
}));

describe("ToastProvider", () => {
  let root: Root | undefined;

  afterEach(async () => {
    await act(async () => {
      root?.unmount();
    });
    root = undefined;
    closeToast.mockReset();
    toastContainer.mockClear();
    document.body.innerHTML = "";
  });

  it("dismisses a toast from the visible close button while retaining auto-dismiss", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<ToastProvider />);
    });

    const closeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Dismiss notification"]',
    );
    expect(closeButton).not.toBeNull();

    await act(async () => {
      closeButton?.click();
    });

    expect(closeToast).toHaveBeenCalledTimes(1);
    expect(toastContainer).toHaveBeenCalledWith(
      expect.objectContaining({ autoClose: 3500, closeOnClick: false }),
    );
  });
});
