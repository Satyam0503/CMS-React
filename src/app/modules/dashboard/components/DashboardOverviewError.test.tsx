import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardOverviewError } from "./DashboardOverviewError";

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

let root: Root | null = null;
const render = (props: { onRetry: () => void; isRetrying?: boolean }) => {
  const container = document.createElement("div");
  root = createRoot(container);
  act(() => root!.render(<DashboardOverviewError {...props} />));
  return container;
};

describe("DashboardOverviewError", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("announces the load failure and retries when the action is activated", () => {
    const onRetry = vi.fn();
    const container = render({ onRetry });
    const retryButton = container.querySelector("button");

    expect(container.querySelector('[role="alert"]')?.textContent).toContain("DASHBOARD.LOAD_ERROR");
    expect(retryButton?.textContent).toContain("DASHBOARD.RETRY");
    act(() => retryButton?.click());
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("disables the retry action while a retry is already running", () => {
    const container = render({ onRetry: vi.fn(), isRetrying: true });
    const button = container.querySelector("button");
    expect(button?.hasAttribute("disabled")).toBe(true);
    expect(button?.textContent).toContain("DASHBOARD.RETRYING");
  });
});
