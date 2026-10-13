import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("../../../../server/axios", () => ({ postRequest: postMock }));
import { PayrollPayGroupsPanel, type PayrollPayGroup } from "./PayrollPayGroupsPanel";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; document.body.innerHTML = ""; vi.clearAllMocks(); });
const group: PayrollPayGroup = { id: "group-1", name: "Monthly", schedule: "MONTHLY", effectiveFrom: "2026-10-01", isActive: false, version: 4 };

async function render(canEdit = true, profiles: Parameters<typeof PayrollPayGroupsPanel>[0]["profiles"] = [], groups = [group]) {
  const container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
  const onSaved = vi.fn().mockResolvedValue(undefined);
  await act(async () => root!.render(<PayrollPayGroupsPanel groups={groups} profiles={profiles} canEdit={canEdit} onSaved={onSaved} />));
  return { container, onSaved };
}
describe("pay group editing", () => {
  it("reactivates the existing record with its ID, dates and expected version", async () => {
    postMock.mockResolvedValue({ data: { success: true } });
    const { container, onSaved } = await render();
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Edit Monthly pay group"]')!.click());
    expect(container.textContent).toContain("Edit pay group: Monthly");
    await act(async () => container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    const save = [...container.querySelectorAll("button")].find(button => button.textContent === "Update Group")!;
    await act(async () => save.click());
    expect(postMock).toHaveBeenCalledWith("api/payroll/configuration/pay-groups", expect.objectContaining({ id: "group-1", version: 4, isActive: true, effectiveFrom: "2026-10-01T00:00:00" }));
    expect(onSaved).toHaveBeenCalledOnce();
  });
  it("blocks a linked policy starting after the group and explains the dates", async () => {
    const { container } = await render(true, [{ id: "policy-1", name: "November", effectiveFrom: "2026-11-01", isActive: true, approvalStatus: "APPROVED" }], [{ ...group, policyProfileId: "policy-1" }]);
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Edit Monthly pay group"]')!.click());
    expect(container.textContent).toContain("starts 01 Nov 2026, after this group begins");
    expect([...container.querySelectorAll("button")].find(button => button.textContent === "Update Group")!.disabled).toBe(true);
    expect(postMock).not.toHaveBeenCalled();
  });
  it("hides editing for a user without edit permission", async () => {
    const { container } = await render(false);
    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).toContain("Inactive");
  });
});
