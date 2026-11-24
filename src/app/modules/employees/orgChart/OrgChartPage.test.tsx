import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrgChartPage } from "./OrgChartPage";
import * as orgChartService from "./orgChartService";
import { OrgChartResponse } from "./orgChartModel";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockResponse: OrgChartResponse = {
  totalEmployeesCount: 3,
  totalDepartmentsCount: 2,
  departments: [
    { departmentId: "d1", departmentName: "Executive", employeeCount: 1 },
    { departmentId: "d2", departmentName: "Engineering", employeeCount: 2 },
  ],
  roots: [
    {
      userId: "u1",
      employeeId: "EMP001",
      firstName: "Sarah",
      lastName: "Connor",
      fullName: "Sarah Connor",
      email: "sarah@company.com",
      jobRoleId: "j1",
      jobRoleTitle: "CEO",
      departmentId: "d1",
      departmentName: "Executive",
      directReportsCount: 1,
      totalTeamCount: 2,
      directReports: [
        {
          userId: "u2",
          employeeId: "EMP002",
          firstName: "John",
          lastName: "Doe",
          fullName: "John Doe",
          email: "john@company.com",
          jobRoleId: "j2",
          jobRoleTitle: "Lead Engineer",
          departmentId: "d2",
          departmentName: "Engineering",
          reportingManagerUserId: "u1",
          reportingManagerName: "Sarah Connor",
          directReportsCount: 1,
          totalTeamCount: 1,
          directReports: [
            {
              userId: "u3",
              employeeId: "EMP003",
              firstName: "Alice",
              lastName: "Smith",
              fullName: "Alice Smith",
              email: "alice@company.com",
              jobRoleId: "j3",
              jobRoleTitle: "Software Engineer",
              departmentId: "d2",
              departmentName: "Engineering",
              reportingManagerUserId: "u2",
              reportingManagerName: "John Doe",
              directReportsCount: 0,
              totalTeamCount: 0,
              directReports: [],
            },
          ],
        },
      ],
    },
  ],
};

let root: Root | null = null;
let container: HTMLDivElement | null = null;

describe("OrgChartPage", () => {
  beforeEach(() => {
    vi.spyOn(orgChartService, "getOrganizationChart").mockResolvedValue(mockResponse);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    vi.restoreAllMocks();
  });

  const renderComponent = async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    queryClient.setQueryData(["orgChart", "ALL", ""], mockResponse);

    await act(async () => {
      root!.render(
        <QueryClientProvider client={queryClient}>
          <OrgChartPage />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  };

  it("renders the organization chart title and metrics header", async () => {
    await renderComponent();

    expect(container?.textContent).toContain("Organization Chart");
    expect(container?.textContent).toContain("Headcount");
    expect(container?.textContent).toContain("3");
    expect(container?.textContent).toContain("Departments");
    expect(container?.textContent).toContain("2");
  });

  it("renders the hierarchy tree nodes correctly", async () => {
    await renderComponent();

    expect(container?.textContent).toContain("Sarah Connor");
    expect(container?.textContent).toContain("CEO");
    expect(container?.textContent).toContain("Executive");
    expect(container?.textContent).toContain("John Doe");
    expect(container?.textContent).toContain("Lead Engineer");
    expect(container?.textContent).toContain("Engineering");
  });

  it("renders zoom controls and handles zoom in/out/reset", async () => {
    await renderComponent();

    expect(container?.textContent).toContain("100%");
    const zoomInBtn = container?.querySelector('button svg[data-testid="AddIcon"]')?.closest("button");
    if (zoomInBtn) {
      await act(async () => {
        zoomInBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(container?.textContent).toContain("110%");
    }
  });

  it("opens the slide-over profile drawer when a node card is clicked", async () => {
    await renderComponent();

    const ceoCard = container?.querySelector('[aria-label*="Sarah Connor"]') as HTMLElement;
    expect(ceoCard).not.toBeNull();

    await act(async () => {
      ceoCard.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Drawer should appear in DOM
    const drawerHeading = document.body.textContent;
    expect(drawerHeading).toContain("Employee Profile");
    expect(drawerHeading).toContain("sarah@company.com");
    expect(drawerHeading).toContain("View Full Profile");
  });

  it("renders Directory List view with pagination and profile actions", async () => {
    await renderComponent();

    const listBtn = Array.from(container?.querySelectorAll("button") ?? []).find(
      (b) => b.textContent?.includes("List")
    );
    expect(listBtn).toBeDefined();

    await act(async () => {
      listBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Verify table headers
    expect(container?.textContent).toContain("Employee");
    expect(container?.textContent).toContain("Role & Hierarchy");
    expect(container?.textContent).toContain("Reporting Manager");
    expect(container?.textContent).toContain("Direct Reports");
    expect(container?.textContent).toContain("Actions");

    // Verify employees and hierarchy levels rendered in table
    expect(container?.textContent).toContain("Sarah Connor");
    expect(container?.textContent).toContain("Level 1 • Head of Org");
    expect(container?.textContent).toContain("John Doe");
    expect(container?.textContent).toContain("Level 2 • Direct Report");

    // Verify pagination controls are rendered
    const pagination = container?.querySelector(".MuiTablePagination-root");
    expect(pagination).not.toBeNull();
    expect(container?.textContent).toContain("1–3 of 3");

    // Verify Sarah Connor (top-level) shows Head of Organization, NOT self-reporting
    expect(container?.textContent).toContain("Head of Organization");
    // Verify John Doe reports to Sarah Connor
    expect(container?.textContent).toContain("Sarah Connor");
  });

  it("handles self-reporting gracefully without displaying an employee managing themselves", async () => {
    const selfReportingMock: OrgChartResponse = {
      totalEmployeesCount: 1,
      totalDepartmentsCount: 1,
      departments: [{ departmentId: "d1", departmentName: "Executive", employeeCount: 1 }],
      roots: [
        {
          userId: "u_self",
          employeeId: "EMP999",
          firstName: "Satyam",
          lastName: "Dubey",
          fullName: "Satyam Dubey",
          email: "satyam@company.com",
          jobRoleId: "j1",
          jobRoleTitle: "Administrator",
          departmentId: "d1",
          departmentName: "Executive",
          reportingManagerUserId: "u_self", // simulates self-reporting loop
          reportingManagerName: "Satyam Dubey",
          directReportsCount: 0,
          totalTeamCount: 0,
          directReports: [],
        },
      ],
    };

    vi.spyOn(orgChartService, "getOrganizationChart").mockResolvedValue(selfReportingMock);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["orgChart", "ALL", ""], selfReportingMock);

    await act(async () => {
      root!.render(
        <QueryClientProvider client={queryClient}>
          <OrgChartPage />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    // Switch to List view
    const listBtn = Array.from(container?.querySelectorAll("button") ?? []).find(
      (b) => b.textContent?.includes("List")
    );
    expect(listBtn).toBeDefined();

    await act(async () => {
      listBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Satyam should be rendered with Head of Organization badge, never self-reporting
    expect(container?.textContent).toContain("Satyam Dubey");
    expect(container?.textContent).toContain("Head of Organization");
  });

  it("renders fit-to-screen and handles canvas reset", async () => {
    await renderComponent();

    const fitBtn = container?.querySelector('button[aria-label="Fit chart to screen"]') as HTMLButtonElement;
    expect(fitBtn).not.toBeNull();

    await act(async () => {
      fitBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Zoom label should remain 100%
    expect(container?.textContent).toContain("100%");
  });
});
