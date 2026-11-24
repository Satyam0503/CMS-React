import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeeShortcutsCard } from "./EmployeeShortcutsCard";

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) => defaultMessage ?? id,
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (inRouter = true) => {
  container = document.createElement("div");
  root = createRoot(container);
  act(() => {
    if (inRouter) {
      root!.render(
        <MemoryRouter>
          <EmployeeShortcutsCard />
        </MemoryRouter>,
      );
    } else {
      root!.render(<EmployeeShortcutsCard />);
    }
  });
};

describe("EmployeeShortcutsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container = null;
  });

  it("renders all self-service shortcuts with proper navigation destinations inside a router", () => {
    render(true);

    expect(container?.textContent).toContain("Quick Services & Navigation");
    expect(container?.textContent).toContain("Attendance");
    expect(container?.textContent).toContain("Leave Management");
    expect(container?.textContent).toContain("Calendar & Holidays");
    expect(container?.textContent).toContain("My Profile");

    const links = Array.from(container?.querySelectorAll("a") ?? []);
    const destinations = links.map((a) => a.getAttribute("href"));

    expect(destinations).toContain("/attendance");
    expect(destinations).toContain("/leavemanagement");
    expect(destinations).toContain("/calendar");
    expect(destinations).toContain("/profile");
  });

  it("falls back gracefully when rendered outside a router context", () => {
    render(false);

    expect(container?.textContent).toContain("Quick Services & Navigation");
    const links = Array.from(container?.querySelectorAll("a") ?? []);
    expect(links.length).toBe(4);
  });
});

