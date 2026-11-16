import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlProvider } from "react-intl";
import { AddUpdateEmployeeSalary } from "./AddUpdateEmployeeSalary";

const { getRequestMock, postRequestMock } = vi.hoisted(() => ({
  getRequestMock: vi.fn(),
  postRequestMock: vi.fn(),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../../../server/axios", () => ({
  getRequest: getRequestMock,
  postRequest: postRequestMock,
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const initialMockSalary = {
  basicPay: 30000,
  hra: 0,
  lta: 0,
  otherAllowance: 0,
  bonus: 0,
  healthInsurance: 2000,
  paymentFrequency: "Monthly",
  effectiveFrom: "2026-08-06",
  effectiveTo: null,
};

const mockSalaryFormik = {
  values: { ...initialMockSalary },
  initialValues: { ...initialMockSalary },
  handleSubmit: vi.fn(),
};

vi.mock("../../employees/components/UpdateEmployeeSalaryData", () => ({
  UpdateEmployeeSalaryData: ({ formRef }: { formRef: any }) => {
    if (formRef) {
      formRef.current = mockSalaryFormik;
    }
    return <div data-testid="salary-data-mock" />;
  },
}));

const messages = {
  "BUTTON.CANCEL": "Cancel",
  "BUTTON.SAVE": "Save",
  "PAYROLL_SETTINGS.SALARY_SAVED": "Salary saved successfully.",
  "ERROR.SOMETHING_WRONG": "Something went wrong.",
};

describe("AddUpdateEmployeeSalary & EmployeePayrollPenaltyPolicy", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    mockSalaryFormik.values = { ...initialMockSalary };
    mockSalaryFormik.initialValues = { ...initialMockSalary };
    mockSalaryFormik.handleSubmit = vi.fn();

    getRequestMock.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          id: "pol-1",
          userId: "user-123",
          employeeId: "CD-0004",
          name: "Combined LHD + ED monthly allowance",
          combinedLhdEdMonthlyLimit: 2,
          isEnabled: true,
          requiresHrApproval: true,
          defaultDecision: "REVIEW_REQUIRED",
          effectiveFrom: "2026-11-01T00:00:00Z",
          version: 1,
        },
      },
    });

    postRequestMock.mockResolvedValue({
      data: { success: true, message: "Policy saved" },
    });
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    document.body.innerHTML = "";
  });

  it("saves penalty policy directly without submitting salary when salary fields are unchanged", async () => {
    const handleClose = vi.fn();
    const handlePageRefresh = vi.fn();

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={messages}>
          <AddUpdateEmployeeSalary
            open={true}
            userId="user-123"
            employeeId="CD-0004"
            employeeName="Viaan Singh"
            handleClose={handleClose}
            handlePageRefresh={handlePageRefresh}
          />
        </IntlProvider>
      );
    });

    expect(getRequestMock).toHaveBeenCalledWith("api/attendance/penalty/employees/user-123/policy");

    const buttons = Array.from(document.body.querySelectorAll("button"));
    const saveButton = buttons.find((b) => b.textContent?.trim() === "Save");
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.click();
    });

    // Salary handleSubmit should NOT be called because salary was unchanged
    expect(mockSalaryFormik.handleSubmit).not.toHaveBeenCalled();

    // Policy save should be called via POST
    expect(postRequestMock).toHaveBeenCalledWith(
      "api/attendance/penalty/employees/user-123/policy",
      expect.objectContaining({
        userId: "user-123",
        combinedLhdEdMonthlyLimit: 2,
        isEnabled: true,
      })
    );

    expect(handleClose).toHaveBeenCalled();
    expect(handlePageRefresh).toHaveBeenCalled();
  });

  it("provides a dedicated Save Policy button to update policy independently", async () => {
    const handleClose = vi.fn();
    const handlePageRefresh = vi.fn();

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={messages}>
          <AddUpdateEmployeeSalary
            open={true}
            userId="user-123"
            employeeId="CD-0004"
            employeeName="Viaan Singh"
            handleClose={handleClose}
            handlePageRefresh={handlePageRefresh}
          />
        </IntlProvider>
      );
    });

    const buttons = Array.from(document.body.querySelectorAll("button"));
    const savePolicyButton = buttons.find((b) => b.textContent?.includes("Save Policy"));
    expect(savePolicyButton).toBeDefined();

    await act(async () => {
      savePolicyButton?.click();
    });

    expect(postRequestMock).toHaveBeenCalledWith(
      "api/attendance/penalty/employees/user-123/policy",
      expect.any(Object)
    );
    expect(mockSalaryFormik.handleSubmit).not.toHaveBeenCalled();
    expect(handlePageRefresh).toHaveBeenCalled();
  });

  it("submits salary structure when salary fields ARE modified", async () => {
    const handleClose = vi.fn();
    const handlePageRefresh = vi.fn();

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={messages}>
          <AddUpdateEmployeeSalary
            open={true}
            userId="user-123"
            employeeId="CD-0004"
            employeeName="Viaan Singh"
            handleClose={handleClose}
            handlePageRefresh={handlePageRefresh}
          />
        </IntlProvider>
      );
    });

    // Mark salary as modified
    mockSalaryFormik.values.basicPay = 35000;

    const buttons = Array.from(document.body.querySelectorAll("button"));
    const saveButton = buttons.find((b) => b.textContent?.trim() === "Save");
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.click();
    });

    // Salary handleSubmit SHOULD be called because basicPay changed
    expect(mockSalaryFormik.handleSubmit).toHaveBeenCalled();
  });
});
