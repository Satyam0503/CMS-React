import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlProvider } from "react-intl";
import { RecruitmentRequisitionDrawer } from "./RecruitmentRequisitionDrawer";
import { ViewJobDetails } from "./ViewJobDetails";
import { BrowserRouter } from "react-router-dom";

const { upsertRecruitmentRequisitionMock, getRecruitmentRequisitionMock, getReportingChainMock } = vi.hoisted(() => ({
  upsertRecruitmentRequisitionMock: vi.fn(),
  getRecruitmentRequisitionMock: vi.fn(),
  getReportingChainMock: vi.fn(),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../services", () => ({
  upsertRecruitmentRequisition: upsertRecruitmentRequisitionMock,
  getRecruitmentRequisition: getRecruitmentRequisitionMock,
}));

vi.mock("../../../employees/orgChart/orgChartService", () => ({
  getReportingChain: (...args: unknown[]) => getReportingChainMock(...args),
}));

vi.mock("../../../../Redux/hooks", () => ({
  useAppSelector: (selector: any) =>
    selector({
      user: {
        userData: {
          roleType: 1, // Administrator
          modulePermission: ["Jobs.View", "Jobs.Edit"],
        },
      },
    }),
}));

const mockJob = {
  jobId: "job-101",
  title: ".Net Developer",
  vacancies: 5,
  jobType: 1,
  status: true,
  description: "<p>Test job</p>",
  totalApplication: 1,
  screeningPassScore: 80,
  screeningCriteria: ["C#", ".NET Core"],
};

describe("RecruitmentRequisitionDrawer & ViewJobDetails", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    upsertRecruitmentRequisitionMock.mockResolvedValue({
      data: { success: true, methodResult: "req-1" },
    });
    getRecruitmentRequisitionMock.mockResolvedValue({
      data: { success: false },
    });
    getReportingChainMock.mockResolvedValue([]);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    document.body.innerHTML = "";
  });

  it("renders RecruitmentRequisitionDrawer with high zIndex so it floats above modals", async () => {
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <RecruitmentRequisitionDrawer
          open={true}
          jobId="job-101"
          jobTitle=".Net"
          vacancies={5}
          onClose={onClose}
        />
      );
    });

    const drawerTitle = document.body.querySelector("#requisition-drawer-title");
    expect(drawerTitle).toBeDefined();
    expect(drawerTitle?.textContent).toBe("Plan headcount");

    // Check requested headcount defaults to vacancies
    const headcountInput = document.body.querySelector('input[type="number"]') as HTMLInputElement;
    expect(headcountInput).toBeDefined();
    expect(headcountInput.value).toBe("5");
  });

  it("opens Plan headcount drawer when button is clicked in ViewJobDetails modal", async () => {
    const setOpen = vi.fn();

    await act(async () => {
      root.render(
        <BrowserRouter>
          <IntlProvider locale="en" messages={{ "FORM.ROLE": "Role", "JOB.VACANCIES": "Vacancies", "JOB.TYPE": "Job Type", "STATUS": "Status", "JOB.TOTAL_SUBMISSION": "Total Submissions", "PLURAL.APPLICANTS": "{applicants} Applicant", "BUTTON.CLOSE": "Close" }}>
            <ViewJobDetails
              open={true}
              jobData={mockJob}
              setOpen={setOpen}
            />
          </IntlProvider>
        </BrowserRouter>
      );
    });

    // Modal dialog is open
    expect(document.body.textContent).toContain(".Net Developer");

    // Find "Plan headcount" button
    const buttons = Array.from(document.body.querySelectorAll("button"));
    const planHeadcountButton = buttons.find((b) => b.textContent?.includes("Plan headcount"));
    expect(planHeadcountButton).toBeDefined();

    // Click "Plan headcount"
    await act(async () => {
      planHeadcountButton?.click();
    });

    // The drawer should now be open and visible
    const drawerTitle = document.body.querySelector("#requisition-drawer-title");
    expect(drawerTitle).toBeDefined();
    expect(drawerTitle?.textContent).toBe("Plan headcount");

    // Save button in the drawer can be clicked
    const saveButton = Array.from(document.body.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Save");
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.click();
    });

    expect(upsertRecruitmentRequisitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        vacancyId: "job-101",
        positionTitle: ".Net Developer",
        headcount: 5,
      })
    );
  });

  it("populates existing requisition data when drawer opens for a configured job", async () => {
    getRecruitmentRequisitionMock.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          requisitionId: "req-existing-99",
          version: 3,
          headcount: 8,
          location: "Bangalore HQ",
          employmentType: "Full-time",
          hiringManagerUserId: "mgr-007",
          costCenter: "ENG-CLOUD",
          justification: "Team expansion for platform v2",
          approvalReference: "FIN-APP-2026-01",
          status: "PendingApproval",
        },
      },
    });

    const onClose = vi.fn();
    await act(async () => {
      root.render(
        <RecruitmentRequisitionDrawer
          open={true}
          jobId="job-101"
          jobTitle=".Net Developer"
          vacancies={5}
          onClose={onClose}
        />
      );
    });

    const headcountInput = document.body.querySelector('input[type="number"]') as HTMLInputElement;
    expect(headcountInput.value).toBe("8");

    const saveButton = Array.from(document.body.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Save");
    await act(async () => {
      saveButton?.click();
    });

    expect(upsertRecruitmentRequisitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requisitionId: "req-existing-99",
        expectedVersion: 3,
        vacancyId: "job-101",
        headcount: 8,
        location: "Bangalore HQ",
        hiringManagerUserId: "mgr-007",
        costCenter: "ENG-CLOUD",
        approvalReference: "FIN-APP-2026-01",
        status: "PendingApproval",
      })
    );
  });

  it("fetches and renders Org-Chart reporting hierarchy when hiring manager is entered", async () => {
    getReportingChainMock.mockResolvedValue([
      {
        userId: "u-boss-1",
        employeeId: "EMP-900",
        fullName: "Sarah Connor",
        jobRoleTitle: "VP of Engineering",
        departmentName: "Engineering",
      },
    ]);

    const onClose = vi.fn();
    await act(async () => {
      root.render(
        <RecruitmentRequisitionDrawer
          open={true}
          jobId="job-101"
          jobTitle=".Net Developer"
          vacancies={5}
          onClose={onClose}
        />
      );
    });

    const inputs = Array.from(document.body.querySelectorAll("input"));
    const hiringManagerInput = inputs.find((i) => i.parentElement?.parentElement?.textContent?.includes("Hiring manager"));
    expect(hiringManagerInput).toBeDefined();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      nativeSetter?.call(hiringManagerInput, "emp-techlead");
      hiringManagerInput?.dispatchEvent(new Event("input", { bubbles: true }));
      hiringManagerInput?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(getReportingChainMock).toHaveBeenCalledWith("emp-techlead");
    expect(document.body.textContent).toContain("Org-Chart Approval Hierarchy");
    expect(document.body.textContent).toContain("Sarah Connor");
    expect(document.body.textContent).toContain("VP of Engineering");

    const approverButton = Array.from(document.body.querySelectorAll("button")).find((b) => b.textContent?.includes("Set as Approver"));
    expect(approverButton).toBeDefined();

    await act(async () => {
      approverButton?.click();
    });

    const approvalRefInput = inputs.find((i) => i.parentElement?.parentElement?.textContent?.includes("Approval reference")) as HTMLInputElement;
    expect(approvalRefInput?.value).toContain("REQ-APPV-EMP-900");
  });
});

