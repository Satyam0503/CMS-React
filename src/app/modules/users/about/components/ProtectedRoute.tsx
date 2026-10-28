import { FC } from "react";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { Navigate } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";

interface PropsTypes {
  module?: ModulesName;
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  adminOnly?:boolean;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module, permission = Permission.View, permissions, adminOnly=false }) => {
  const userRoleType = useAppSelector(state=>state.user.userData?.roleType!);
  const token = useAppSelector(state => state.auth.token);
  const userData = useAppSelector(state => state.user.userData);
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  // AuthInit restores the user details asynchronously after a refresh. Do not
  // redirect while the token exists but the permission list is still loading.
  if (token && !userData) {
    return null;
  }
  // If a module is specified, check if the module is active for the company.
  // When a module is removed/disabled for the company, NO ONE (not even Administrator) may access it.
  if (module) {
    if (module === ModulesName.CareerProfile) {
      const hasRecruitment = modulePermissions.some(
        (p) => p.startsWith("Jobs.") || p.startsWith("Applications.") || p.startsWith("Process_Log.")
      );
      if (!hasRecruitment) {
        return <Navigate to={"/unauthorize"} replace />;
      }
    }

    if (module === ModulesName.PayrollSettings) {
      const hasPayroll = modulePermissions.some((p) => p.startsWith("PayRoll."));
      if (!hasPayroll) {
        return <Navigate to={"/unauthorize"} replace />;
      }
    }

    const isModuleActive = modulePermissions.some((p) => p.startsWith(`${module}.`));
    if (!isModuleActive) {
      return <Navigate to={"/unauthorize"} replace />;
    }

    // Module is active: Administrator has full access
    if (userRoleType === Roles.Administrator) {
      return <>{children}</>;
    }

    // Other roles: check granular permissions
    const hasAccess = permissions?.length
      ? permissions.some((perm) => hasModuleFeaturePermission(module, perm, modulePermissions))
      : hasModuleFeaturePermission(module, permission, modulePermissions);

    return hasAccess ? <>{children}</> : <Navigate to={"/unauthorize"} replace />;
  }

  if (adminOnly) {
    return userRoleType === Roles.Administrator ? <>{children}</> : <Navigate to={"/unauthorize"} replace />;
  }

  if (userRoleType === Roles.Administrator) {
    return <>{children}</>;
  }

  return <Navigate to={"/unauthorize"} replace />;
};
