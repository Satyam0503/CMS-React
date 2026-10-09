import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deleteRequestMock, getRequestMock, postRequestMock } = vi.hoisted(() => ({ deleteRequestMock: vi.fn(), getRequestMock: vi.fn(), postRequestMock: vi.fn() }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../../../server/axios", () => ({
  getRequest: getRequestMock,
  postRequest: postRequestMock,
  deleteRequest: deleteRequestMock,
}));

vi.mock("@mui/icons-material", () => ({
  AddRounded: () => null, BadgeOutlined: () => null, CheckCircleRounded: () => null,
  CloudUploadRounded: () => null, ExpandMoreRounded: () => null, FolderOffOutlined: () => null,
  GroupsOutlined: () => null, HourglassEmptyRounded: () => null, PaymentsOutlined: () => null,
  ReceiptLongOutlined: () => null, RefreshRounded: () => null, RestartAltRounded: () => null,
  SaveRounded: () => null, SearchRounded: () => null, TuneRounded: () => null,
  AccountBalanceOutlined: () => null, CalendarMonthOutlined: () => null, FactCheckOutlined: () => null,
  ShieldOutlined: () => null,
}));

import { PayrollConfigurationPanel } from "./PayrollConfigurationPanel";

const roots: Root[] = [];
let profiles: Array<Record<string, unknown>> = [];
let assignments: Array<Record<string, unknown>> = [];
let components: Array<Record<string, unknown>> = [];

function renderPanel() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  return { container, root };
}

beforeEach(() => {
  profiles = [];
  assignments = [];
  components = [];
  postRequestMock.mockReset();
  deleteRequestMock.mockReset();
  deleteRequestMock.mockResolvedValue({ data: { success: true } });
  getRequestMock.mockImplementation(async (url: string) => {
    if (url === "api/payroll/configuration/policies") return { data: profiles };
    if (url === "api/payroll/divisor-policy") return { data: {} };
    if (url === "api/payroll/configuration/assignments") return { data: assignments };
    if (url === "api/payroll/configuration/components") return { data: components };
    return { data: [] };
  });
});

afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("PayrollConfigurationPanel statutory profile editor", () => {
  it("opens an existing draft in update mode with its values prefilled", async () => {
    profiles = [{
      id: "policy-draft-1", name: "Regional policy", version: 2, statutoryJurisdiction: "IN-KA",
      financialYear: "2026-27", statutoryRuleVersion: "reviewed-1", approvalStatus: "DRAFT",
      divisorPolicy: "CALENDAR_DAYS", requireAttendanceLock: true, epfMode: "CAPPED_CEILING",
      epfWageCeiling: 15000, epfEmployeeRatePercent: 12, epfEmployerRatePercent: 12,
      esicMode: "STATUTORY", esicWageCeiling: 21000, esicEmployeeRatePercent: 0.75,
      esicEmployerRatePercent: 3.25, tdsMode: "AUTO_NEW_REGIME", scope: "COMPANY_DEFAULT",
      effectiveFrom: "2026-10-01", isActive: true,
    }];
    postRequestMock.mockResolvedValue({ data: { success: true } });
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));
    const editButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Edit draft"));
    await act(async () => editButton?.click());
    expect(container.textContent).toContain("Update payroll policy draft");
    expect(Array.from(container.querySelectorAll("input")).some((input) => (input as HTMLInputElement).value === "Regional policy")).toBe(true);
    const saveButton = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent?.includes("Update payroll policy draft")).at(-1);
    expect((saveButton as HTMLButtonElement | undefined)?.disabled).toBe(false);
    await act(async () => saveButton?.click());
    await vi.waitFor(() => expect(postRequestMock.mock.calls.filter(([url]) => url === "api/payroll/configuration/policies")).toHaveLength(1));
    expect(postRequestMock.mock.calls.find(([url]) => url === "api/payroll/configuration/policies")?.[1]).toEqual(expect.objectContaining({
      id: "policy-draft-1", version: 2, name: "Regional policy",
    }));
  });

  it("creates a revision instead of changing an approved policy", async () => {
    profiles = [{
      id: "policy-approved-1", name: "Regional policy", version: 3, statutoryJurisdiction: "IN-KA",
      financialYear: "2026-27", statutoryRuleVersion: "reviewed-1", approvalStatus: "APPROVED",
      divisorPolicy: "CALENDAR_DAYS", requireAttendanceLock: true, epfMode: "CAPPED_CEILING",
      epfWageCeiling: 15000, epfEmployeeRatePercent: 12, epfEmployerRatePercent: 12,
      esicMode: "STATUTORY", esicWageCeiling: 21000, esicEmployeeRatePercent: 0.75,
      esicEmployerRatePercent: 3.25, tdsMode: "AUTO_NEW_REGIME", scope: "COMPANY_DEFAULT",
      effectiveFrom: "2026-10-01", isActive: true,
    }];
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));
    const revisionButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Create revision"));
    await act(async () => revisionButton?.click());
    expect(container.textContent).toContain("Create a dated policy version");
    expect(container.textContent).not.toContain("Update payroll policy draft");
    expect(Array.from(container.querySelectorAll("input")).some((input) => (input as HTMLInputElement).value === "Regional policy (revision)")).toBe(true);
  });

  it("only renders draft deletion for draft profiles", async () => {
    profiles = [
      { id: "policy-draft", name: "Draft policy", version: 1, approvalStatus: "DRAFT", effectiveFrom: "2026-10-01", isActive: true },
      { id: "policy-approved", name: "Approved policy", version: 2, approvalStatus: "APPROVED", effectiveFrom: "2026-10-01", isActive: true },
    ];
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} canDeletePolicy />));
    expect(Array.from(container.querySelectorAll("button")).filter((button) => button.textContent?.includes("Delete draft"))).toHaveLength(1);
  });

  it("confirms and sends the versioned delete request for a draft", async () => {
    profiles = [{ id: "policy-draft", name: "Draft policy", version: 4, approvalStatus: "DRAFT", effectiveFrom: "2026-10-01", isActive: true }];
    const { container, root } = renderPanel();
    await act(async () => root.render(<IntlProvider locale="en" messages={{ "BUTTON.CANCEL": "Cancel", "BUTTON.DELETE": "Delete" }}><PayrollConfigurationPanel canEdit canApprove={false} canDeletePolicy /></IntlProvider>));
    const deleteButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Delete draft"));
    await act(async () => deleteButton?.click());
    expect(deleteRequestMock).not.toHaveBeenCalled();
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('Delete draft "Draft policy"? This cannot be undone.');
    const confirmButton = Array.from(dialog?.querySelectorAll("button") ?? []).find((button) => button.textContent?.trim() === "Delete");
    expect(confirmButton).toBeDefined();
    await act(async () => confirmButton?.click());
    await vi.waitFor(() => expect(deleteRequestMock).toHaveBeenCalledWith("api/payroll/configuration/policies/policy-draft?version=4"));
  });

  it("labels the salary review workspace and shows its live pending count", async () => {
    getRequestMock.mockImplementation(async (url: string) => {
      if (url === "api/payroll/configuration/employee-salaries/pending") return { data: [
        { id: "salary-1", employeeId: "EMP-1", effectiveFrom: "2026-10-01", approvalStatus: "DRAFT", status: "DRAFT", source: "IMPORT:batch-1", version: 1, components: [] },
        { id: "salary-2", employeeId: "EMP-2", effectiveFrom: "2026-10-01", approvalStatus: "SUBMITTED", status: "PENDING_REVIEW", source: "MANUAL", version: 1, components: [] },
      ] };
      if (url === "api/payroll/configuration/policies") return { data: profiles };
      if (url === "api/payroll/divisor-policy") return { data: {} };
      if (url === "api/payroll/configuration/assignments") return { data: assignments };
      if (url === "api/payroll/configuration/components") return { data: components };
      return { data: [] };
    });
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    const salaryReviewTab = Array.from(container.querySelectorAll('[role="tab"]')).find((item) => item.textContent?.includes("Salary Import & Review"));
    expect(salaryReviewTab).toBeDefined();
    await act(async () => (salaryReviewTab as HTMLElement)?.click());
    await vi.waitFor(() => expect(salaryReviewTab?.textContent).toContain("2 pending"));
  });

  it("renders ampersands as symbols instead of leaking HTML entities", async () => {
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    expect(container.textContent).toContain("Payroll & Statutory Configuration");
    expect(container.textContent).toContain("Salary Import & Review");
    expect(container.textContent).not.toContain("&amp;");
  });

  it("opens profile creation automatically for a company with no profiles", async () => {
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    expect(container.querySelector("#payroll-policy-draft-heading")?.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("First payroll month");
    expect(container.textContent).toContain("Save payroll policy draft");
  });

  it("explains how company rules become effective in a payroll run", async () => {
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    expect(container.textContent).toContain("How this policy reaches payroll");
    expect(container.textContent).toContain("Choose company rules");
    expect(container.textContent).toContain("Set the effective months");
    expect(container.textContent).toContain("Submit and approve");
    expect(container.textContent).toContain("Assign and calculate");
    expect(container.textContent).toContain("first covered payroll month");
    expect(container.textContent).toContain("last covered month");
    expect(container.textContent).toContain("Coverage preview:");
    expect(container.textContent).toContain("no scheduled end");
    expect(container.textContent).toContain("continues until a later approved version takes effect");
    expect(container.textContent).toContain("Existing payroll snapshots keep the version already used.");
  });

  it("keeps existing profile history compact until HR opens a new version", async () => {
    profiles = [{
      id: "profile-1", name: "Approved FY policy", version: 1,
      statutoryJurisdiction: "IN-GJ", financialYear: "2026-27", statutoryRuleVersion: "adviser-v1",
      approvalStatus: "APPROVED", scope: "COMPANY_DEFAULT", divisorPolicy: "CALENDAR_DAYS",
      requireAttendanceLock: true, epfMode: "CAPPED_CEILING", epfWageCeiling: 15000,
      epfEmployeeRatePercent: 12, epfEmployerRatePercent: 12, esicMode: "STATUTORY",
      esicWageCeiling: 21000, esicEmployeeRatePercent: 0.75, esicEmployerRatePercent: 3.25,
      tdsMode: "AUTO_NEW_REGIME", effectiveFrom: "2026-04-01", isActive: true,
    }];
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    expect(container.querySelector("#payroll-policy-draft-heading")?.getAttribute("aria-expanded")).toBe("false");
    expect(container.textContent).toContain("Approved FY policy");
    const createButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Create policy version"));
    expect(createButton).toBeDefined();
    await act(async () => createButton?.click());
    expect(container.querySelector("#payroll-policy-draft-heading")?.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("PayrollConfigurationPanel effective-dated assignment approvals", () => {
  async function openAssignments(canEdit = true, canApprove = true) {
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit={canEdit} canApprove={canApprove} />));
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find((item) => item.textContent?.includes("Employee Assignments"));
    await act(async () => (tab as HTMLElement)?.click());
    return container;
  }

  it("requires an audit reason before Admin can reject an assignment", async () => {
    assignments = [{ id: "assignment-pending", employeeId: "EMP-REJECT", effectiveFrom: "2026-10-01T00:00:00", isApproved: false }];
    postRequestMock.mockResolvedValue({ data: { success: true } });
    const container = await openAssignments();

    const reject = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Reject");
    await act(async () => reject?.click());
    expect(document.body.textContent).toContain("Reject payroll assignment");
    const submit = Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Reject assignment") as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(postRequestMock.mock.calls.some(([url]) => String(url).includes("assignments/reject"))).toBe(false);


  });
  it("approves only the selected revision when one employee has multiple effective-dated assignments", async () => {
    assignments = [
      { id: "assignment-jan", employeeId: "EMP-1", payGroupId: "group-1", effectiveFrom: "2026-01-01T00:00:00", isApproved: false },
      { id: "assignment-jun", employeeId: "EMP-1", payGroupId: "group-1", effectiveFrom: "2026-06-01T00:00:00", isApproved: false },
    ];
    postRequestMock.mockImplementation(async (url: string) => {
      const effectiveFrom = new URLSearchParams(url.split("?")[1]).get("effectiveFrom");
      assignments = assignments.map((assignment) => assignment.effectiveFrom === effectiveFrom ? { ...assignment, isApproved: true } : assignment);
      return { data: { success: true } };
    });
    const container = await openAssignments();
    const rowCheckboxes = Array.from(container.querySelectorAll("tbody input[type=checkbox]")) as HTMLInputElement[];
    expect(rowCheckboxes).toHaveLength(2);

    await act(async () => rowCheckboxes[0].click());
    expect(container.textContent).toContain("Approve Selected (1)");
    const approve = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Approve Selected"));
    await act(async () => approve?.click());

    await vi.waitFor(() => expect(postRequestMock.mock.calls.filter(([url]) => String(url).includes("employeeId=EMP-1&effectiveFrom=2026-01-01"))).toHaveLength(1));
    const rows = Array.from(container.querySelectorAll("tbody tr"));
    expect(rows[0].textContent).toContain("Approved");
    expect(rows[1].textContent).toContain("Pending Approval");
  });

  it("retains only failed rows after partial bulk approval and does not claim full success", async () => {
    assignments = [
      { id: "assignment-1", employeeId: "EMP-1", payGroupId: "group-1", effectiveFrom: "2026-01-01T00:00:00", isApproved: false },
      { id: "assignment-2", employeeId: "EMP-2", payGroupId: "group-1", effectiveFrom: "2026-01-01T00:00:00", isApproved: false },
    ];
    postRequestMock.mockImplementation(async (url: string) => {
      if (url.includes("employeeId=EMP-1")) {
        assignments = assignments.map((assignment) => assignment.employeeId === "EMP-1" ? { ...assignment, isApproved: true } : assignment);
        return { data: { success: true } };
      }
      return { data: { success: false, message: "Approval denied" } };
    });
    const container = await openAssignments();
    const rowCheckboxes = Array.from(container.querySelectorAll("tbody input[type=checkbox]")) as HTMLInputElement[];
    await act(async () => { rowCheckboxes.forEach((checkbox) => checkbox.click()); });
    const approve = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Approve Selected"));
    await act(async () => approve?.click());

    await vi.waitFor(() => expect(postRequestMock.mock.calls.filter(([url]) => String(url).includes("employeeId="))).toHaveLength(2));
    await vi.waitFor(() => expect(container.textContent).toContain("Approve Selected (1)"));
    const rows = Array.from(container.querySelectorAll("tbody tr"));
    expect(rows[0].textContent).toContain("Approved");
    expect(rows[1].textContent).toContain("Pending Approval");
  });

  it("does not expose assignment approval controls to edit-only users", async () => {
    assignments = [{ id: "assignment-1", employeeId: "EMP-1", effectiveFrom: "2026-01-01T00:00:00", isApproved: false }];
    const container = await openAssignments(true, false);

    expect(container.querySelectorAll("tbody input[type=checkbox]")).toHaveLength(0);
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Approve")).toBe(false);
    expect(container.textContent).toContain("Pending Approval");
  });

  it("allows approvers to approve without granting edit access", async () => {
    assignments = [{ id: "assignment-1", employeeId: "EMP-1", effectiveFrom: "2026-01-01T00:00:00", isApproved: false }];
    postRequestMock.mockResolvedValue({ data: { success: true } });
    const container = await openAssignments(false, true);

    expect(container.querySelectorAll("tbody input[type=checkbox]")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Approve")).toBe(true);
  });

  it("shows assignment end dates and labels open-ended assignments clearly", async () => {
    assignments = [
      { id: "assignment-ended", employeeId: "EMP-1", payGroupId: "group-1", effectiveFrom: "2026-09-01T00:00:00", effectiveTo: "2026-12-31T00:00:00", isApproved: true },
      { id: "assignment-open", employeeId: "EMP-2", payGroupId: "group-1", effectiveFrom: "2026-10-01T00:00:00", isApproved: false },
    ];
    const container = await openAssignments();

    const fromHeader = Array.from(container.querySelectorAll("th")).find((cell) => cell.textContent?.trim() === "Effective from");
    const toHeader = Array.from(container.querySelectorAll("th")).find((cell) => cell.textContent?.trim() === "Effective to");
    expect(fromHeader).toBeDefined();
    expect(toHeader).toBeDefined();
    expect(container.textContent).toContain("2026-12-31");
    expect(container.textContent).toContain("No end date");
  });

  it("does not render browser-native date inputs for employee assignments", async () => {
    const container = await openAssignments();
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0);
  });
});

describe("PayrollConfigurationPanel optional salary components", () => {
  it("lets a company include a bonus from the feature selector using a new effective-dated version", async () => {
    components = [{
      id: "component-bonus-v1", code: "BONUS", name: "Performance bonus", kind: "EARNING",
      calculationType: "FIXED", isTaxable: true, effectiveFrom: "2026-04-01", isActive: false, version: 1,
    }];
    postRequestMock.mockImplementation(async (url: string, payload: Record<string, unknown>) => {
      if (url === "api/payroll/configuration/components") {
        components = [...components, {
          ...components.find((component) => component.id === payload.id),
          ...payload,
          id: "component-bonus-v2",
          version: 2,
        }];
      }
      return { data: { success: true } };
    });
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));

    const includeBonus = container.querySelector<HTMLInputElement>('input[aria-label="Include Performance bonus in payroll"]');
    expect(includeBonus?.checked).toBe(false);
    await act(async () => includeBonus?.click());

    await vi.waitFor(() => expect(postRequestMock).toHaveBeenCalledWith("api/payroll/configuration/components", expect.objectContaining({
      id: "component-bonus-v1", code: "BONUS", isActive: true, version: 1,
      effectiveFrom: expect.stringMatching(/T00:00:00$/),
    })));
    await vi.waitFor(() => expect(container.querySelector<HTMLInputElement>('input[aria-label="Exclude Performance bonus in payroll"]')?.checked).toBe(true));
  });

  it("creates a new effective-dated bonus version without rewriting its prior configuration", async () => {
    components = [{
      id: "component-bonus", code: "BONUS", name: "Performance bonus", kind: "EARNING",
      calculationType: "FIXED", isTaxable: true, effectiveFrom: "2026-04-01", isActive: false, version: 1,
    }];
    postRequestMock.mockImplementation(async (url: string, payload: Record<string, unknown>) => {
      if (url === "api/payroll/configuration/components") {
        components = [...components, { ...payload, id: "component-bonus-v2", version: 2 }];
      }
      return { data: { success: true } };
    });
    const { container, root } = renderPanel();
    await act(async () => root.render(<PayrollConfigurationPanel canEdit canApprove={false} />));
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find((item) => item.textContent?.includes("Salary Components"));
    await act(async () => (tab as HTMLElement)?.click());

    const include = container.querySelector<HTMLInputElement>('input[aria-label="Include Performance bonus v1 in payroll"]');
    expect(include).not.toBeNull();
    expect(include?.checked).toBe(false);
    await act(async () => include?.click());

    expect(postRequestMock).toHaveBeenCalledWith("api/payroll/configuration/components", expect.objectContaining({
      id: "component-bonus", isActive: true, version: 1, effectiveTo: undefined,
      effectiveFrom: expect.not.stringMatching("2026-04-01"),
    }));
    await vi.waitFor(() => expect(container.querySelector<HTMLInputElement>('input[aria-label="Exclude Performance bonus v2 in payroll"]')?.checked).toBe(true));
    expect(components.find((component) => component.id === "component-bonus")?.isActive).toBe(false);
  });
});
