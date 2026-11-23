import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";

let root: Root | null = null;

const renderComponent = (isMiniSidebar: boolean) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(
      <MemoryRouter>
        <SidebarMenuItemWithSub
          index={0}
          isOpen={false}
          to="/payroll"
          title="Payroll & HR"
          icon={<span data-testid="icon">Icon</span>}
          isMiniSidebar={isMiniSidebar}
          setCurrentMenuIndex={vi.fn()}
        >
          <SidebarMenuItem to="/payroll" title="Payroll" isMiniSidebar={isMiniSidebar} />
          <SidebarMenuItem to="/leavemanagement" title="Leave" isMiniSidebar={isMiniSidebar} />
        </SidebarMenuItemWithSub>
      </MemoryRouter>
    );
  });
  return container;
};

describe("SidebarMenuItemWithSub flyout in mini mode", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.innerHTML = "";
  });

  it("renders with aria-haspopup when in mini mode", () => {
    const container = renderComponent(true);
    const button = container.querySelector(".sidebar-parent-item");
    expect(button?.getAttribute("aria-haspopup")).toBe("true");
  });

  it("opens the floating flyout popover on click in mini mode", () => {
    const container = renderComponent(true);
    const button = container.querySelector(".sidebar-parent-item") as HTMLElement;

    act(() => {
      button.click();
    });

    const popover = document.querySelector(".sidebar-flyout-paper");
    expect(popover).not.toBeNull();
    expect(popover?.textContent).toContain("Payroll & HR");
    expect(popover?.textContent).toContain("Payroll");
    expect(popover?.textContent).toContain("Leave");
  });
});

