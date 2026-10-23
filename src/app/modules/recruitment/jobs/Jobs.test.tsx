import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Jobs from "./Jobs";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@mui/icons-material", () => ({
  default: () => <span data-testid="mock-default-icon" />,
  Add: () => <span data-testid="mock-add-icon" />,
  FilterList: () => <span data-testid="mock-filter-icon" />,
  AssignmentOutlined: () => <span data-testid="mock-assignment-icon" />,
}));

vi.mock("../../../shared/components/SearchInput", () => ({
  SearchInput: () => <input data-testid="mock-search-input" />,
}));

vi.mock("@mui/x-data-grid", () => ({
  GridActionsCell: (props: any) => <div>{props.children}</div>,
  GridActionsCellItem: (props: any) => <button onClick={props.onClick}>{props.label}</button>,
}));

vi.mock("../../../Redux/hooks", () => ({
  useAppSelector: (selector: any) => {
    return selector({
      user: { userData: { modulePermission: [] } },
      filters: { jobs: null },
    });
  },
}));

vi.mock("../../../Context/PageDataProvider", () => ({
  usePageData: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock("../../../shared/components/C_DataGrid", () => ({
  CustomDataGrid: (props: any) => {
    const rows = props.row || props.rows || [];
    return (
      <div
        data-testid="custom-data-grid"
        data-columns={(props.columns || []).map((c: any) => c.field).join(",")}
      >
        {(props.columns || []).map((col: any) => (
          <span key={col.field} data-testid={`col-${col.field}`}>
            {col.headerName}
          </span>
        ))}
        {rows.map((row: any) => (
          <div key={row.jobId} data-testid={`row-${row.jobId}`}>
            {(props.columns || []).map((col: any) => (
              <div key={col.field} data-testid={`cell-${row.jobId}-${col.field}`}>
                {col.renderCell ? col.renderCell({ row }) : row[col.field]}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const mockJobs = [
  {
    jobId: "job-1",
    title: "QA Engineer",
    vacancies: 2,
    jobType: 1,
    status: true,
    workflowMode: "Inherit",
    screeningPassScore: null,
    screeningCriteria: [],
  },
  {
    jobId: "job-2",
    title: ".Net Developer",
    vacancies: 4,
    jobType: 1,
    status: true,
    workflowMode: "Direct",
    screeningPassScore: null,
    screeningCriteria: [],
  },
  {
    jobId: "job-3",
    title: "Lead Architect",
    vacancies: 1,
    jobType: 1,
    status: true,
    workflowMode: "Standard",
    screeningPassScore: 75,
    screeningCriteria: ["System Design", "Architecture"],
  },
];

let mockConfigResponse = {
  data: {
    success: true,
    methodResult: {
      recruitmentMode: "Simple",
      allowJobWorkflowCustomization: false,
      scorecards: false,
      autoAdvanceOnScreening: true,
      screeningPassScore: 60,
    },
  },
};

let mockJobsResponse = {
  data: {
    success: true,
    methodResults: [mockJobs[0], mockJobs[1]],
    totalRecords: 2,
  },
};

vi.mock("../services", () => ({
  getAllJobVacancies: vi.fn(() => Promise.resolve(mockJobsResponse)),
  getRecruitmentEnterpriseConfig: vi.fn(() => Promise.resolve(mockConfigResponse)),
  deleteJobVacancy: vi.fn().mockResolvedValue({ data: { success: true } }),
  editJobVacancy: vi.fn().mockResolvedValue({ data: { success: true } }),
  addJobVacancy: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("Jobs Component - Flexible Screening Threshold Column", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    const activeRoot = root;
    const activeContainer = container;
    if (activeRoot && activeContainer) {
      act(() => {
        activeRoot.unmount();
      });
      activeContainer.remove();
    }
    container = null;
    root = null;
  });

  it("omits the Screening Threshold column when company is in Simple mode and no jobs have thresholds", async () => {
    mockConfigResponse = {
      data: {
        success: true,
        methodResult: {
          recruitmentMode: "Simple",
          allowJobWorkflowCustomization: false,
          scorecards: false,
          autoAdvanceOnScreening: true,
          screeningPassScore: 60,
        },
      },
    };
    mockJobsResponse = {
      data: {
        success: true,
        methodResults: [mockJobs[0], mockJobs[1]],
        totalRecords: 2,
      },
    };

    await act(async () => {
      root!.render(
        <IntlProvider locale="en" messages={{}}>
          <Jobs />
        </IntlProvider>
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const grid = container?.querySelector('[data-testid="custom-data-grid"]');
    expect(grid).not.toBeNull();
    const columns = grid?.getAttribute("data-columns")?.split(",") ?? [];

    expect(columns).toContain("title");
    expect(columns).toContain("vacancies");
    expect(columns).toContain("jobType");
    expect(columns).toContain("status");
    expect(columns).toContain("action");

    // Screening threshold column should NOT be visible
    expect(columns).not.toContain("screeningPassScore");
    expect(container?.querySelector('[data-testid="col-screeningPassScore"]')).toBeNull();
  });

  it("displays the Screening Threshold column when company enables per-job customization and renders accurate role chips", async () => {
    mockConfigResponse = {
      data: {
        success: true,
        methodResult: {
          recruitmentMode: "Simple",
          allowJobWorkflowCustomization: true,
          scorecards: false,
          autoAdvanceOnScreening: true,
          screeningPassScore: 60,
        },
      },
    };
    mockJobsResponse = {
      data: {
        success: true,
        methodResults: mockJobs,
        totalRecords: 3,
      },
    };

    await act(async () => {
      root!.render(
        <IntlProvider locale="en" messages={{}}>
          <Jobs />
        </IntlProvider>
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const grid = container?.querySelector('[data-testid="custom-data-grid"]');
    expect(grid).not.toBeNull();
    const columns = grid?.getAttribute("data-columns")?.split(",") ?? [];

    // Column should be displayed
    expect(columns).toContain("screeningPassScore");
    expect(container?.querySelector('[data-testid="col-screeningPassScore"]')).not.toBeNull();

    // Row 1 (QA Engineer: no threshold in Simple mode) should render "—"
    const cell1 = container?.querySelector('[data-testid="cell-job-1-screeningPassScore"]');
    expect(cell1?.textContent).toContain("—");

    // Row 2 (.Net Developer: Direct hire mode) should render "— (Direct Hire)"
    const cell2 = container?.querySelector('[data-testid="cell-job-2-screeningPassScore"]');
    expect(cell2?.textContent).toContain("— (Direct Hire)");

    // Row 3 (Lead Architect: threshold 75) should render "≥ 75% (Role)"
    const cell3 = container?.querySelector('[data-testid="cell-job-3-screeningPassScore"]');
    expect(cell3?.textContent).toContain("≥ 75% (Role)");
  });

  it("displays company policy threshold when tenant is in Standard mode with auto-advance enabled", async () => {
    mockConfigResponse = {
      data: {
        success: true,
        methodResult: {
          recruitmentMode: "Standard",
          allowJobWorkflowCustomization: false,
          scorecards: true,
          autoAdvanceOnScreening: true,
          screeningPassScore: 65,
        },
      },
    };
    mockJobsResponse = {
      data: {
        success: true,
        methodResults: [mockJobs[0]], // Job with null threshold
        totalRecords: 1,
      },
    };

    await act(async () => {
      root!.render(
        <IntlProvider locale="en" messages={{}}>
          <Jobs />
        </IntlProvider>
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const grid = container?.querySelector('[data-testid="custom-data-grid"]');
    expect(grid).not.toBeNull();
    const columns = grid?.getAttribute("data-columns")?.split(",") ?? [];

    expect(columns).toContain("screeningPassScore");

    // Job with null threshold should inherit company threshold
    const cell = container?.querySelector('[data-testid="cell-job-1-screeningPassScore"]');
    expect(cell?.textContent).toContain("≥ 65% (Company)");
  });
});
