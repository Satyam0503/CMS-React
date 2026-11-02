import { FC, ReactNode, useEffect, useRef } from "react";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { toast } from "react-toastify";

interface PropsTypes {
  module?: ModulesName;
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  adminOnly?: boolean;
}

export const UnauthorizedStay: FC<{ message?: string }> = ({
  message = "Access Denied: You do not have permission to access this page.",
}) => {
  const navigate = useNavigate();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!hasNotified.current) {
      hasNotified.current = true;
      toast.error(message);
    }
    // If user navigated from another page within the application, stay at current page by going back
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Direct navigation in fresh tab: fallback to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, message]);

  return null;
};

export const ProtectedRoute: FC<PropsTypes> = ({ children, module, permission = Permission.View, permissions, adminOnly=false }) => {
  const userRoleType = useAppSelector(state=>state.user.userData?.roleType!);
  const token = useAppSelector(state => state.auth?.token);
  const userData = useAppSelector(state => state.user.userData);
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  // AuthInit restores the user details asynchronously after a refresh. Do not
  // redirect while the token exists but the permission list is still loading.
  if (token && !userData) {
    return null;
  }

  // Administrators bypass module permission checks and always have full access
  if (userRoleType === Roles.Administrator) {
    return <>{children}</>;
  }

  if (adminOnly) {
    return <UnauthorizedStay />;
  }

  // If a module is specified, check if the module is active for the company.
  if (module) {
    if (module === ModulesName.CareerProfile) {
      const hasRecruitment = modulePermissions.some(
        (p) => p.startsWith("Jobs.") || p.startsWith("Applications.") || p.startsWith("Process_Log.")
      );
      if (!hasRecruitment) {
        return <UnauthorizedStay />;
      }
    }

    if (module === ModulesName.PayrollSettings) {
      const hasPayroll = modulePermissions.some((p) => p.startsWith("PayRoll."));
      if (!hasPayroll) {
        return <UnauthorizedStay />;
      }
    }

    const isModuleActive = modulePermissions.some((p) => p.startsWith(`${module}.`));
    if (!isModuleActive) {
      return <UnauthorizedStay />;
    }

    // Other roles: check granular permissions
    const hasAccess =
      module === ModulesName.Attendance
        ? isModuleActive
        : permissions?.length
        ? permissions.some((perm) => hasModuleFeaturePermission(module, perm, modulePermissions))
        : hasModuleFeaturePermission(module, permission, modulePermissions);

    return hasAccess ? <>{children}</> : <UnauthorizedStay />;
  }

  return <UnauthorizedStay />;
};
