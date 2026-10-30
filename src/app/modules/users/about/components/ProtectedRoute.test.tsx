import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute, UnauthorizedStay } from "./ProtectedRoute";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock react-toastify
const mockToastError = vi.fn();
vi.mock("react-toastify", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock Redux hooks with dynamic state
let mockReduxState: any = {
  auth: { token: "valid-jwt" },
  user: {
    userData: {
      roleType: Roles.Administrator,
      modulePermission: [],
    },
  },
};

vi.mock("../../../../Redux/hooks", () => ({
  useAppSelector: (selector: any) => selector(mockReduxState),
}));

describe("ProtectedRoute & UnauthorizedStay End-to-End In-Depth Suite", () => {
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

  describe("1. Administrator Universal Access", () => {
    beforeEach(() => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.Administrator,
            modulePermission: [], // Empty permissions in database
          },
        },
      };
    });

    it("allows Administrator to access Jobs even with zero Jobs permissions", async () => {
      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs}>
          <div data-testid="recruitment-jobs-page">Jobs Dashboard Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="recruitment-jobs-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Applications even with zero Applications permissions", async () => {
      await renderComponent(
        <ProtectedRoute module={ModulesName.Applications}>
          <div data-testid="recruitment-applications-page">Applications Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="recruitment-applications-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Career Profile even with no recruitment permissions", async () => {
      await renderComponent(
        <ProtectedRoute module={ModulesName.CareerProfile}>
          <div data-testid="career-profile-page">Career Profile Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="career-profile-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Payroll Settings even with no PayRoll permissions", async () => {
      await renderComponent(
        <ProtectedRoute module={ModulesName.PayrollSettings}>
          <div data-testid="payroll-settings-page">Payroll Settings Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="payroll-settings-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to access Admin-only routes without restriction", async () => {
      await renderComponent(
        <ProtectedRoute adminOnly={true}>
          <div data-testid="admin-tools-page">Admin Tools Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="admin-tools-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("allows Administrator to perform Edit actions on any module without explicit Edit string", async () => {
      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs} permission={Permission.Edit}>
          <div data-testid="edit-job-form">Edit Job Form Content</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="edit-job-form"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("2. Non-Administrator Role Access & Isolation", () => {
    it("blocks Employee from accessing adminOnly pages and triggers UnauthorizedStay", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.Employee,
            modulePermission: [`${ModulesName.Attendance}.View`],
          },
        },
      };

      await renderComponent(
        <ProtectedRoute adminOnly={true}>
          <div data-testid="admin-secret-page">Admin Secret</div>
        </ProtectedRoute>
      );

      // Child should NOT be rendered
      expect(container?.querySelector('[data-testid="admin-secret-page"]')).toBeNull();
      // Toast notification must be triggered
      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
    });

    it("blocks Employee from accessing Jobs if they lack Jobs permissions", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.Employee,
            modulePermission: [`${ModulesName.Attendance}.View`],
          },
        },
      };

      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs}>
          <div data-testid="jobs-page">Jobs Page</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="jobs-page"]')).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
    });

    it("allows HR Manager to access Jobs when they have Jobs.View permission", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: [`${ModulesName.Jobs}.View`],
          },
        },
      };

      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs}>
          <div data-testid="jobs-page">Jobs Page</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="jobs-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("blocks HR Manager from Editing Jobs when they only have Jobs.View permission", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: [`${ModulesName.Jobs}.View`],
          },
        },
      };

      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs} permission={Permission.Edit}>
          <div data-testid="edit-job-page">Edit Job Page</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="edit-job-page"]')).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
    });

    it("allows HR Manager to Edit Jobs when they possess Jobs.Edit permission", async () => {
      mockReduxState = {
        auth: { token: "valid-jwt" },
        user: {
          userData: {
            roleType: Roles.HRManager,
            modulePermission: [`${ModulesName.Jobs}.View`, `${ModulesName.Jobs}.Edit`],
          },
        },
      };

      await renderComponent(
        <ProtectedRoute module={ModulesName.Jobs} permission={Permission.Edit}>
          <div data-testid="edit-job-page">Edit Job Page</div>
        </ProtectedRoute>
      );

      expect(container?.querySelector('[data-testid="edit-job-page"]')).not.toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe("3. UnauthorizedStay Navigation Behavior", () => {
    it("navigates back (-1) to stay on current page when user navigated from within the app", async () => {
      // Simulate browser history idx > 0
      window.history.replaceState({ idx: 2 }, "");

      await renderComponent(<UnauthorizedStay />);

      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("navigates to /dashboard when user enters unauthorized URL directly in fresh tab", async () => {
      // Simulate fresh tab with no prior history stack (idx = 0)
      window.history.replaceState({ idx: 0 }, "");

      await renderComponent(<UnauthorizedStay />);

      expect(mockToastError).toHaveBeenCalledWith(
        "Access Denied: You do not have permission to access this page."
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  describe("4. Authentication Hydration Safeguard", () => {
    it("renders null while session token is restoring and userData has not loaded yet", async () => {
      mockReduxState = {
        auth: { token: "restoring-token" },
        user: { userData: null }, // still restoring
      };

      await renderComponent(
        <ProtectedRoute module={ModulesName.Employees}>
          <div data-testid="employees-page">Employees Page</div>
        </ProtectedRoute>
      );

      // Must not render child or trigger unauthorized error
      expect(container?.querySelector('[data-testid="employees-page"]')).toBeNull();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
