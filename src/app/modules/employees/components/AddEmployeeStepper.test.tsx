import React, { act } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddEmployeeStepper } from "./AddEmployeeStepper";

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock("@mui/icons-material", () => ({
  CalendarMonth: () => null,
  CurrencyRupee: () => null,
  EditDocument: () => null,
  PersonAdd: () => null,
}));

vi.mock("@mui/material", async () => {
  const ReactModule = await import("react");
  const children = (tag: string) => ({ children: child }: { children?: React.ReactNode }) => ReactModule.createElement(tag, null, child);
  return {
    Box: children("div"),
    Dialog: ({ open, children: child }: { open: boolean; children?: React.ReactNode }) => open ? ReactModule.createElement("div", null, child) : null,
    DialogActions: children("div"),
    DialogContent: children("div"),
    DialogTitle: children("div"),
    Slide: children("div"),
    Step: children("div"),
    StepConnector: () => null,
    stepConnectorClasses: { alternativeLabel: "alternativeLabel", active: "active", completed: "completed", line: "line" },
    StepLabel: children("div"),
    Stepper: children("div"),
    styled: () => () => null,
    Typography: children("div"),
  };
});

vi.mock("./InviteNewEmployee", () => ({
  InviteNewEmployee: ({ handleInviteUser }: { handleInviteUser: (success: boolean, employee: { userId: string; employeeId: string }) => void }) =>
    <button onClick={() => handleInviteUser(true, { userId: "user-1", employeeId: "employee-1" })}>Mock invite</button>,
}));

vi.mock("./UpdateEmployeeData", () => ({
  UpdateEmployeeData: ({ onUserUpdate }: { onUserUpdate: (success: boolean, dateOfJoining?: Dayjs | null) => void }) => <button onClick={() => onUserUpdate(true, dayjs("2026-11-01"))}>Mock update data</button>,
}));

vi.mock("./UpdateEmployeeSalaryData", () => ({
  UpdateEmployeeSalaryData: ({ onUserUpdate, defaultEffectiveFrom }: { onUserUpdate: (saved: boolean) => void; defaultEffectiveFrom?: string }) => (
    <div data-testid="salary-step" data-effective-from={defaultEffectiveFrom}>
      <button onClick={() => onUserUpdate(false)}>Mock salary save failure</button>
      <button onClick={() => onUserUpdate(true)}>Mock salary saved</button>
    </div>
  ),
}));

vi.mock("./LeaveAllocateForm", () => ({
  LeaveAllocateForm: () => <div data-testid="leave-step">Leave allocation</div>,
}));

vi.mock("../../../shared/components/ui", () => ({
  AppButton: ({ children: child, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
    <button onClick={onClick}>{child}</button>,
}));

describe("AddEmployeeStepper salary gate", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
  });

  async function openSalaryStep() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root?.render(<AddEmployeeStepper open handleReresh={() => undefined} handleClose={() => undefined} />));
    await act(async () => container.querySelector<HTMLButtonElement>("button")?.click());
    await act(async () => container.querySelector<HTMLButtonElement>("button")?.click());
  }

  it("keeps salary setup open when saving fails and provides no close bypass", async () => {
    await openSalaryStep();

    expect(container.querySelector('[data-testid="salary-step"]')).not.toBeNull();
    expect(container.textContent).not.toContain("BUTTON.CLOSE");

    const failure = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Mock salary save failure");
    await act(async () => failure?.click());

    expect(container.querySelector('[data-testid="salary-step"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="leave-step"]')).toBeNull();
  });

  it("defaults the salary effective date to the joining date saved in employee details", async () => {
    await openSalaryStep();

    expect(container.querySelector('[data-testid="salary-step"]')?.getAttribute("data-effective-from")).toBe("2026-11-01");
  });

  it("advances to optional leave allocation only after salary is saved", async () => {
    await openSalaryStep();

    const success = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Mock salary saved");
    await act(async () => success?.click());

    expect(container.querySelector('[data-testid="salary-step"]')).toBeNull();
    expect(container.querySelector('[data-testid="leave-step"]')).not.toBeNull();
  });
});
