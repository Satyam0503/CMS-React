import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecruitmentGuard } from "./PrivateRoutes";
import { Roles } from "../../utils/enums";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  Navigate: ({ to }: { to: string }) => <div data-testid={`navigate-to-${to}`} />,
  Route: () => null,
  Routes: () => null,
}));

// Mock react-toastify
const mockToastError = vi.fn();
vi.mock("react-toastify", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock Redux state
let mockReduxState: any = {
  auth: { token: "test-token" },
  user: {
    userData: {
      roleType: Roles.Administrator,
      modulePermission: [],
    },
  },
};

vi.mock("../Redux/hooks", () => ({
  useAppSelector: (selector: any) => selector(mockReduxState),
}));

describe("RecruitmentGuard End-to-End Suite", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
  });

  const renderComponent = async (element: React.ReactElement) => {
    await act(async () => {
      root!.render(element);
    });
  };

  describe("Administrator Role", () => {
    it("renders null while session token is present but userData is still hydrating", async () => {
      mockReduxState = {
        auth: { token: "restoring-token" },
        user: { userData: null },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Recruitment suite when permissions array is empty", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.Administrator,
            modulePermission: [],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Recruitment when modulePermission only has other modules", async () => {
      mockReduxState = {
        user: {
          userData: {
            roleType: Roles.Administrator,
            modulePermission: ["Offboarding.View", "Attendance.View", "Employees.View"],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Employee & Non-Admin Roles", () => {
    it("blocks Employee with no recruitment permissions and triggers unauthorized notice", async () => {
      mockReduxState = {
        user: {
          userData: {
            roleType: Roles.Employee,
            modulePermission: ["Attendance.View", "Employees.View"],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
    });

    it("allows Non-Admin when they have Jobs.View permission", async () => {
      mockReduxState = {
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: ["Jobs.View"],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("allows Non-Admin when they have Applications.View permission", async () => {
      mockReduxState = {
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: ["Applications.View"],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("allows Non-Admin when they have Process_Log.View permission", async () => {
      mockReduxState = {
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: ["Process_Log.View"],
          },
        },
      };

      await renderComponent(
        <RecruitmentGuard>
          <div data-testid="recruitment-content">Recruitment Workspace</div>
        </RecruitmentGuard>
      );

      expect(container?.querySelector('[data-testid="recruitment-content"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });
});
