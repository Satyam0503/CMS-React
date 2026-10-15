import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppStylePicker } from "./AppStylePicker";
import { Roles } from "../../../../../utils/enums";

const mockSetCompanyTheme = vi.fn();
const mockSetPersonalStyle = vi.fn();
const mockClearPersonalStyle = vi.fn();
let mockHasStoredStyle = false;
let mockCompanyTheme = "glass";
let mockPersonalStyle = "glass";
let mockUserRole: Roles = Roles.Administrator;

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) => defaultMessage || id,
  }),
}));

vi.mock("../../../../../app/modules/theme/companyTheme", () => ({
  useCompanyTheme: () => ({
    theme: mockCompanyTheme,
    setTheme: mockSetCompanyTheme,
  }),
}));

vi.mock("../../../../../app/modules/theme/useAppStyle", () => ({
  APP_STYLES: [
    { value: "glass", label: "Glass", description: "Translucent surfaces with backdrop blur" },
    { value: "slate", label: "Slate", description: "Warm off-white with calm grey-blue depth" },
    { value: "dawn", label: "Dawn", description: "Crisp lavender glass with rose accents" },
    { value: "blush", label: "Blush", description: "Soft pink workspace with clean white surfaces" },
  ],
  useAppStyle: () => ({
    style: mockPersonalStyle,
    setStyle: mockSetPersonalStyle,
    clearStyle: mockClearPersonalStyle,
    hasStoredStyle: mockHasStoredStyle,
  }),
}));

vi.mock("../../../../../app/Redux/hooks", () => ({
  useAppSelector: (selector: (state: any) => any) =>
    selector({
      user: {
        userData: {
          roleType: mockUserRole,
          modulePermission: [],
        },
      },
    }),
}));

vi.mock("../../../../../server/axios", () => ({
  putRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AppStylePicker", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  beforeEach(() => {
    mockHasStoredStyle = false;
    mockCompanyTheme = "glass";
    mockPersonalStyle = "glass";
    mockUserRole = Roles.Administrator;
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
  });

  it("renders trigger button and opens popover on click with 4 theme cards", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<AppStylePicker />);
    });

    const triggerBtn = container.querySelector('button[aria-label="choose app style"]');
    expect(triggerBtn).not.toBeNull();

    // Open popover
    await act(async () => {
      triggerBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Verify popover header and theme names
    expect(document.body.textContent).toContain("Workspace Theme");
    expect(document.body.textContent).toContain("Inheriting company default");
    expect(document.body.textContent).toContain("Glass");
    expect(document.body.textContent).toContain("Slate");
    expect(document.body.textContent).toContain("Dawn");
    expect(document.body.textContent).toContain("Blush");
  });

  it("calls setPersonalStyle when a theme card is clicked", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<AppStylePicker />);
    });

    const triggerBtn = container.querySelector('button[aria-label="choose app style"]');
    await act(async () => {
      triggerBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const slateOption = Array.from(document.querySelectorAll('[role="button"]')).find((el) =>
      el.textContent?.includes("Slate"),
    );
    expect(slateOption).toBeDefined();

    await act(async () => {
      slateOption?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockSetPersonalStyle).toHaveBeenCalledWith("slate");
  });

  it("shows personal badge and reset button when personal override is active", async () => {
    mockHasStoredStyle = true;
    mockPersonalStyle = "slate";

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<AppStylePicker />);
    });

    const triggerBtn = container.querySelector('button[aria-label="choose app style"]');
    await act(async () => {
      triggerBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Personal preference override");
    expect(document.body.textContent).toContain("Reset to default");

    const resetBtn = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Reset to default"),
    );
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockClearPersonalStyle).toHaveBeenCalled();
  });

  it("shows admin default section for administrators with sync indicator when matching", async () => {
    mockHasStoredStyle = false;
    mockCompanyTheme = "glass";
    mockPersonalStyle = "glass";

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<AppStylePicker />);
    });

    const triggerBtn = container.querySelector('button[aria-label="choose app style"]');
    await act(async () => {
      triggerBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Company Default");
    expect(document.body.textContent).toContain("Synced");
  });

  it("shows set company default button when active style differs from company theme", async () => {
    mockHasStoredStyle = true;
    mockCompanyTheme = "glass";
    mockPersonalStyle = "slate";

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<AppStylePicker />);
    });

    const triggerBtn = container.querySelector('button[aria-label="choose app style"]');
    await act(async () => {
      triggerBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain('Set "Slate"');
  });
});

