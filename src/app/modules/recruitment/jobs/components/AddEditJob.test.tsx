import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddEditJob } from "./AddEditJob";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock("../../../../Redux/hooks", () => ({
  useAppSelector: () => "en",
}));

vi.mock("../../../../../_themes/i18n/Metronici18n", () => ({
  useAppLang: () => ({ currentLanguage: "en" }),
}));

vi.mock("../../../admin/adminservices", () => ({
  getAllDepartments: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResults: [
        { departmentId: "dept-1", titles: { en: "Engineering" } },
      ],
    },
  }),
}));

vi.mock("../../services", () => ({
  getRecruitmentEnterpriseConfig: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResult: {
        allowJobWorkflowCustomization: true,
      },
    },
  }),
}));

vi.mock("../../../../shared/components/TextEditor", () => ({
  default: () => <div data-testid="mock-text-editor" />,
}));

const mockInitialValues = {
  jobId: "job-101",
  title: "Full Stack Developer - .NET & React",
  vacancies: 4,
  jobType: 1,
  status: true,
  description: "<p>Full Stack role</p>",
  summary: "Full Stack Developer with 2-4 years of experience",
  location: "Dehradun, Uttarakhand",
  employmentType: "Full-time",
  experienceMin: 2,
  experienceMax: 4,
  department: "Engineering",
  industry: "Information Technology & Services",
  functionalArea: "Software Engineering",
  roleCategory: "Full Stack Development",
  educationRequirement: "B.Tech/B.E. in Computer Science",
  requiredSkills: ["C#", ".NET Core", "React.js"],
  preferredSkills: ["Azure", "Docker"],
  responsibilities: ["Design scalable web applications"],
  benefits: ["Health insurance"],
  keywords: ["Full Stack", ".NET", "React"],
  shiftType: "General",
  workingDays: "Monday–Friday",
  recruiterContactEmail: "recruiter@example.com",
  publishToCareerPortal: true,
  publishToMasterPortal: false,
  isFeatured: false,
  isUrgentHiring: false,
};

describe("AddEditJob UI & Responsive Form", () => {
  afterEach(() => document.body.replaceChildren());

  it("renders the enhanced form with aligned sections, status card, and field labels", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AddEditJob
          initialValues={mockInitialValues}
          isEdit={true}
          open={true}
          handleClose={vi.fn()}
          handleAddEditJob={vi.fn()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    // Verify section headers
    expect(document.body.textContent).toContain("Role Overview & Status");
    expect(document.body.textContent).toContain("Career portal details");
    expect(document.body.textContent).toContain("Full job description");

    // Verify Active status card & badge
    expect(document.body.textContent).toContain("Active Vacancy");
    expect(document.body.textContent).toContain("Accepting Applications");

    // Verify floating select labels
    expect(document.body.textContent).toContain("Employment type");
    expect(document.body.textContent).toContain("Department");
    expect(document.body.textContent).toContain("Shift type");
    expect(document.body.textContent).toContain("Working days");

    // Verify balanced fields
    expect(document.body.textContent).toContain("Short summary");
    expect(document.body.textContent).toContain("Location");
    expect(document.body.textContent).toContain("Industry");
    expect(document.body.textContent).toContain("Functional area");
    expect(document.body.textContent).toContain("Role category");
    expect(document.body.textContent).toContain("Education requirement");
    expect(document.body.textContent).toContain("Keywords");
    expect(document.body.textContent).toContain("Visibility and promotion");

    // Verify Hiring Workflow & Governance section
    expect(document.body.textContent).toContain("Hiring Workflow & Governance");
    expect(document.body.textContent).toContain("Hiring Workflow Mode");
    expect(document.body.textContent).toContain("Require interview rounds before hiring decision");
    expect(document.body.textContent).toContain("Require preboarding checklist before employee conversion");

    await act(async () => {
      root.unmount();
    });
  });

  it("hides Hiring Workflow & Governance and Screening Criteria when company disables per-job customization", async () => {
    const { getRecruitmentEnterpriseConfig } = await import("../../services");
    vi.mocked(getRecruitmentEnterpriseConfig).mockResolvedValueOnce({
      data: {
        success: true,
        methodResult: {
          allowJobWorkflowCustomization: false,
        },
      },
    } as any);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AddEditJob
          initialValues={mockInitialValues}
          isEdit={true}
          open={true}
          handleClose={vi.fn()}
          handleAddEditJob={vi.fn()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    // Core role fields remain visible
    expect(document.body.textContent).toContain("Role Overview & Status");
    expect(document.body.textContent).toContain("Career portal details");
    expect(document.body.textContent).toContain("Full job description");

    // Per-job custom workflow and screening criteria sections are hidden
    expect(document.body.textContent).not.toContain("Hiring Workflow & Governance");
    expect(document.body.textContent).not.toContain("Screening Pass Threshold & Evaluation Criteria");
    expect(document.body.textContent).not.toContain("Hiring Workflow Mode");

    await act(async () => {
      root.unmount();
    });
  });
});

