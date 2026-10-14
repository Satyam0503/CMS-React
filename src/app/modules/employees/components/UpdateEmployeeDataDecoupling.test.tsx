import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpdateEmployeeData } from "./UpdateEmployeeData";
import * as adminServices from "../../admin/adminservices";

vi.mock("@mui/icons-material", () => ({}));

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  FormattedMessage: ({ id }: { id: string }) => <span>{id}</span>,
}));

vi.mock("../../../../_themes/i18n/Metronici18n", () => ({
  useAppLang: () => ({ currentLanguage: "en" }),
}));

vi.mock("../../../Redux/hooks", () => ({
  useAppSelector: () => "en",
}));

vi.mock("../../admin/adminservices", () => ({
  getAllDepartments: vi.fn(),
  getAllRoles: vi.fn(),
  getJobTitles: vi.fn(),
}));

vi.mock("../employeeServices", () => ({
  getAllEmployees: vi.fn().mockResolvedValue({ data: { success: true, methodResults: [] } }),
  updateEmployee: vi.fn(),
}));

describe("UpdateEmployeeData Decoupling", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    vi.clearAllMocks();
  });

  it("calls getJobTitles(true) without passing departmentId on mount", async () => {
    vi.mocked(adminServices.getAllDepartments).mockResolvedValue({
      data: {
        success: true,
        methodResults: [{ departmentId: "dept-1", titles: { en: "Engineering" }, isActive: true }],
        totalRecords: 1,
      },
    } as any);

    vi.mocked(adminServices.getAllRoles).mockResolvedValue({
      data: {
        success: true,
        methodResults: [{ rolesId: "role-1", titles: "Developer", description: "", isNotEditable: false, isDefault: false, userRoles: [], hasAppAccess: true }],
        totalRecords: 1,
      },
    } as any);

    vi.mocked(adminServices.getJobTitles).mockResolvedValue({
      data: {
        success: true,
        methodResults: [{ jobTitleId: "jt-1", departmentId: null, isActive: true, titles: { en: "Lead Engineer" } }],
        totalRecords: 1,
      },
    } as any);

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const formRef = { current: null };
    const employeeData = {
      userId: "u-1",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      employeeId: "EMP-1",
      department: null,
      reportingManager: null,
    };

    await act(async () => {
      root?.render(
        <UpdateEmployeeData
          employeeData={employeeData}
          onUserUpdate={vi.fn()}
          formRef={formRef}
          handleButtonLoading={vi.fn()}
        />
      );
    });

    expect(adminServices.getJobTitles).toHaveBeenCalledWith(true);
    expect(adminServices.getJobTitles).not.toHaveBeenCalledWith(true, expect.anything());
  });
});

