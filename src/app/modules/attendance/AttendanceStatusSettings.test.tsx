import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AttendanceStatusSettings from "./AttendanceStatusSettings";
import { getRequest, postRequest } from "../../../server/axios";

vi.mock("../../../server/axios", () => ({
  getRequest: vi.fn(),
  postRequest: vi.fn(),
  deleteRequest: vi.fn(),
}));

vi.mock("../../Context/PageDataProvider", () => ({
  usePageData: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

type StatusPayload = {
  id?: string;
  code: string;
  name: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  requiresTime: boolean;
  isAvailableForLeaveManagement: boolean;
  colorHex: string;
  paidDayFraction: number;
  unpaidDayFraction: number;
};

const makeStatus = (overrides: Partial<StatusPayload> = {}): StatusPayload => ({
  id: overrides.code ?? "status-1",
  code: "P",
  name: "Present",
  isActive: true,
  isSystem: true,
  sortOrder: 1,
  requiresTime: true,
  isAvailableForLeaveManagement: false,
  colorHex: "#123456",
  paidDayFraction: 1,
  unpaidDayFraction: 0,
  ...overrides,
});

const getMockedGetRequest = vi.mocked(getRequest as any);
const getMockedPostRequest = vi.mocked(postRequest as any);

const renderComponent = async () => {
  const container = document.createElement("div");
  const root = createRoot(container);

  await act(async () => {
    root.render(<AttendanceStatusSettings />);
    await Promise.resolve();
    await Promise.resolve();
  });

  return { container, root };
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe("AttendanceStatusSettings UI", () => {
  beforeEach(() => {
    getMockedGetRequest.mockImplementation(async (url: string) => {
      const response = (payload: any) => ({
        data: payload,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url, headers: {} },
      } as any);

      if (url.includes("api/attendance-status-settings?activeOnly=false")) {
        return response({ methodResults: [makeStatus()] });
      }
      if (url.includes("api/attendance/penalty/policy")) {
        return response({ name: "Combined LHD + ED monthly limit", combinedLhdEdMonthlyLimit: 2, isEnabled: true, requiresHrApproval: true, defaultDecision: "REVIEW_REQUIRED", effectiveFrom: "2024-01-01", version: 1 });
      }
      if (url.includes("api/attendance/weekly-offs")) {
        return response({ offDays: [0, 6] });
      }
      return response({});
    });

    getMockedPostRequest.mockResolvedValue({ data: { success: true, message: "Saved" } } as any);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("hides the color column in view mode and shows a read-only active checkbox", async () => {
    const { container } = await renderComponent();

    expect(container.textContent).not.toContain("Color");
    expect(container.querySelectorAll('input[type="color"]').length).toBe(0);

    expect(container.textContent).toContain("Active");
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it("shows the color column and editable checkbox in edit mode", async () => {
    const { container } = await renderComponent();
    const editButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Edit settings"));

    expect(editButton).toBeDefined();

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Color");
    expect(container.querySelectorAll('input[type="color"]').length).toBeGreaterThan(0);

    const activeCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    expect(activeCheckbox).not.toBeNull();
    expect(activeCheckbox?.disabled).toBe(false);
  });

  it("saves the updated active state and hides the color column again", async () => {
    const { container } = await renderComponent();
    const editButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Edit settings"));

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();

    await act(async () => {
      checkbox!.click();
      await flush();
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Save changes"));
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flush();
      await flush();
    });

    expect(getMockedPostRequest).toHaveBeenCalled();
    const payload = getMockedPostRequest.mock.calls.at(-1)?.[1] as StatusPayload | undefined;
    expect(payload?.isActive).toBe(false);
    expect(container.textContent).not.toContain("Color");
  });

  it("cancels temporary edits and restores the previous isActive value", async () => {
    const { container } = await renderComponent();
    const editButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Edit settings"));

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();
    expect(checkbox?.checked).toBe(true);

    await act(async () => {
      checkbox!.click();
      await flush();
    });

    const cancelButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Cancel"));
    expect(cancelButton).toBeDefined();

    await act(async () => {
      cancelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flush();
    });

    expect(container.textContent).toContain("Active");
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(container.textContent).not.toContain("Color");
  });
});
