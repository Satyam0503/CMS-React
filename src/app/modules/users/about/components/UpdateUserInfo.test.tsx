import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateUserInfo } from "./UpdateUserInfo";

const mocks = vi.hoisted(() => ({
  canEditEmployees: true,
  currentUserId: "hr-user",
  updateEmployee: vi.fn(),
  updateOwnProfile: vi.fn(),
  updateUserDetails: vi.fn(),
}));

vi.mock("react-intl", () => ({
  FormattedMessage: ({ id }: { id: string }) => <span>{id}</span>,
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useParams: () => ({ employeeid: "employee-2" }) };
});

vi.mock("../../UserDataProvider", () => ({
  useUserDetails: () => ({ updateUserDetails: mocks.updateUserDetails }),
}));

vi.mock("../../../../Redux/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: any) => unknown) => selector({
    user: {
      userData: {
        userId: mocks.currentUserId,
        modulePermission: mocks.canEditEmployees ? ["Employees.Edit"] : [],
        defaultLanguage: "en",
      },
    },
  }),
}));

vi.mock("../../../../../utils/common", () => ({
  hasModuleFeaturePermission: () => mocks.canEditEmployees,
}));

vi.mock("../../../employees/employeeServices", () => ({
  getAllEmployees: vi.fn(async () => ({ data: { success: true, methodResults: [] } })),
  updateEmployee: mocks.updateEmployee,
  updateOwnProfile: mocks.updateOwnProfile,
}));

vi.mock("../../../admin/adminservices", () => ({
  getAllCustomAttributes: vi.fn(async () => ({ data: { success: true, methodResults: [] } })),
  getAllDepartments: vi.fn(async () => ({ data: { success: true, methodResults: [] } })),
  getAllRoles: vi.fn(async () => ({ data: { success: true, methodResults: [{ rolesId: "role-1", titles: "Employee" }] } })),
  getCustomAttributeById: vi.fn(),
  getJobTitles: vi.fn(async () => ({ data: { success: true, methodResults: [] } })),
}));

vi.mock("../../../../_themes/i18n/Metronici18n", () => ({
  useAppLang: () => ({ currentLanguage: "en" }),
}));

vi.mock("../../../../shared/components/C_Modal", () => ({
  CustomisedModal: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
}));

vi.mock("../../../../shared/components/C_DatePicker", () => ({
  default: () => null,
}));

vi.mock("../../../../shared/components/C_Button", () => ({
  default: ({ label, type, disabled, handleClick }: any) => (
    <button type={type ?? "button"} disabled={disabled} onClick={handleClick}>{label}</button>
  ),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const employee = {
  userId: "employee-2",
  employeeId: "EMP-001",
  firstName: "Kiara",
  lastName: "Singh",
  email: "kiara@example.com",
  gender: "Female",
  roleId: "role-1",
  dateOfBirth: null,
  dateOfJoining: "2026-06-01",
  phoneNumber: null,
  department: "",
  bloodGroup: "",
  jobRole: "",
  personalEmail: "",
  emergencyContact: "",
  address: "",
  reportingManager: "",
  employmentType: null,
  bankAccountNumber: null,
  panNumber: null,
  customAttributes: [],
} as any;

describe("UpdateUserInfo employee ID edit flow", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    mocks.canEditEmployees = true;
    mocks.currentUserId = "hr-user";
    mocks.updateEmployee.mockReset().mockResolvedValue({
      data: { success: true, statusCode: 200, methodResult: employee, message: "Updated" },
    });
    mocks.updateOwnProfile.mockReset();
    mocks.updateUserDetails.mockReset();
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    container?.remove();
    container = null;
  });

  const renderModal = () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root?.render(<UpdateUserInfo open setOpen={vi.fn()} userData={employee} />);
    });
    return container;
  };

  const changeInputValue = (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  it("shows an editable Employee ID and submits its changed value for an authorized editor", async () => {
    const element = renderModal();
    const employeeIdInput = element.querySelector<HTMLInputElement>('input[name="employeeId"]');
    expect(employeeIdInput).not.toBeNull();
    expect(employeeIdInput?.disabled).toBe(false);
    expect(employeeIdInput?.value).toBe("EMP-001");

    await act(async () => {
      changeInputValue(employeeIdInput!, "EMP-002");
      element.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    await vi.waitFor(() => expect(mocks.updateEmployee).toHaveBeenCalled());
    expect(mocks.updateEmployee.mock.calls[0][0]).toMatchObject({ employeeId: "EMP-002" });
    expect(mocks.updateEmployee.mock.calls[0][1]).toBe("employee-2");
  });

  it("hides the Employee ID field when the viewer lacks employee edit permission", () => {
    mocks.canEditEmployees = false;
    const element = renderModal();
    expect(element.querySelector('input[name="employeeId"]')).toBeNull();
  });
});
