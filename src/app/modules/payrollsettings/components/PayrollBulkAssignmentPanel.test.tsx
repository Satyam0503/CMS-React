import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const { postMock, toastMock } = vi.hoisted(() => ({ postMock: vi.fn(), toastMock: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("../../../../server/axios", () => ({ postRequest: postMock }));
vi.mock("react-toastify", () => ({ toast: toastMock }));
import { PayrollBulkAssignmentPanel } from "./PayrollBulkAssignmentPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

const groups = [{ id: "group-1", name: "Monthly", schedule: "MONTHLY", effectiveFrom: "2026-01-01", isActive: true }];
async function render() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const onSubmitted = vi.fn().mockResolvedValue(undefined);
  await act(async () => root!.render(<PayrollBulkAssignmentPanel groups={groups} templates={[]} profiles={[]} canEdit onSubmitted={onSubmitted} />));
  return { container, onSubmitted };
}
async function chooseGroup(container: HTMLElement) {
  const selects = container.querySelectorAll<HTMLElement>('[role="combobox"]');
  await act(async () => selects[1].dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  const option = [...document.body.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent?.includes("Monthly"));
  if (!option) throw new Error("Monthly pay group option was not rendered.");
  await act(async () => option.click());
}

describe("payroll bulk assignment cohort", () => {
  it("requires at least one explicit target and a group before preview", async () => {
    const { container } = await render();
    expect(container.textContent).toContain("Choose at least one target");
    const preview = [...container.querySelectorAll("button")].find(button => button.textContent === "Preview cohort");
    expect(preview?.disabled).toBe(true);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("previews a cohort, reports conflicts, and submits eligible rows for Admin approval", async () => {
    postMock
      .mockResolvedValueOnce({ data: { success: true, methodResults: [
        { employeeId: "EMP001", employeeName: "Asha", department: "Engineering", jobRole: "Developer", canSubmit: true },
        { employeeId: "EMP002", employeeName: "Ravi", department: "Engineering", jobRole: "Developer", hasOverlap: true, conflictMessage: "An assignment overlaps the selected effective dates.", canSubmit: false },
      ] } })
      .mockResolvedValueOnce({ data: { success: true, methodResult: { submittedCount: 1, conflictCount: 1 } } });
    const { container, onSubmitted } = await render();
    const ids = container.querySelector<HTMLTextAreaElement>("textarea")!;
    await act(async () => { const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set; setter?.call(ids, "EMP001, EMP002"); ids.dispatchEvent(new Event("input", { bubbles: true })); });
    await chooseGroup(container);
    const preview = [...container.querySelectorAll("button")].find(button => button.textContent === "Preview cohort")!;
    await act(async () => preview.click());
    expect(postMock).toHaveBeenNthCalledWith(1, "api/payroll/configuration/assignments/bulk/preview", expect.objectContaining({ employeeIds: ["EMP001", "EMP002"], payGroupId: "group-1" }));
    expect(container.textContent).toContain("1 eligible");
    expect(container.textContent).toContain("1 conflict(s)");
    const submit = [...container.querySelectorAll("button")].find(button => button.textContent === "Submit eligible assignments")!;
    expect(submit.disabled).toBe(false);
    await act(async () => submit.click());
    expect(postMock).toHaveBeenNthCalledWith(2, "api/payroll/configuration/assignments/bulk", expect.objectContaining({ employeeIds: ["EMP001", "EMP002"], payGroupId: "group-1" }));
    expect(toastMock.success).toHaveBeenCalledWith("1 assignment submitted for Admin approval.");
    expect(onSubmitted).toHaveBeenCalledOnce();
  });

  it("invalidates a successful preview when cohort filters change", async () => {
    postMock.mockResolvedValueOnce({ data: { success: true, methodResults: [
      { employeeId: "EMP001", employeeName: "Asha", canSubmit: true },
    ] } });
    const { container } = await render();
    const ids = container.querySelector<HTMLTextAreaElement>("textarea")!;
    await act(async () => { const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set; setter?.call(ids, "EMP001"); ids.dispatchEvent(new Event("input", { bubbles: true })); });
    await chooseGroup(container);
    const preview = [...container.querySelectorAll("button")].find(button => button.textContent === "Preview cohort")!;
    await act(async () => preview.click());
    const submit = [...container.querySelectorAll("button")].find(button => button.textContent === "Submit eligible assignments")!;
    expect(submit.disabled).toBe(false);
    await act(async () => { const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set; setter?.call(ids, "EMP002"); ids.dispatchEvent(new Event("input", { bubbles: true })); });
    expect(submit.disabled).toBe(true);
    expect(container.textContent).not.toContain("1 eligible");
  });});