import { FC } from "react";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { Navigate } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";

interface PropsTypes {
  module: ModulesName;
  children: React.ReactNode;
  permission?: Permission;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module, permission = Permission.View }) => {
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  if (modulePermissions.length === 0) {
    return <Navigate to={"/unauthorize"} />;
  }
  const hasAccess = hasModuleFeaturePermission(module, permission, modulePermissions);
  if (!hasAccess) {
    return <Navigate to={"/unauthorize"} />;
  }
  return children;
};
