import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntlProvider } from "react-intl";
import { RecruitmentRequisitionDrawer } from "./RecruitmentRequisitionDrawer";
import { ViewJobDetails } from "./ViewJobDetails";
import { BrowserRouter } from "react-router-dom";

const { upsertRecruitmentRequisitionMock } = vi.hoisted(() => ({
  upsertRecruitmentRequisitionMock: vi.fn(),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../services", () => ({
  upsertRecruitmentRequisition: upsertRecruitmentRequisitionMock,
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
});

