import { FC } from "react";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { Navigate } from "react-router-dom";
import { checkPermissionForModulesFeatureAccess } from "../../../../../utils/common";

interface PropsTypes {
  module: ModulesName;
  children: React.ReactNode;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module }) => {
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const hasAccess = checkPermissionForModulesFeatureAccess(
    `${module}.${Permission.View}`,
    modulePermissions
  );
  if (modulePermissions.length === 0 || !hasAccess) {
    return <Navigate to={"/unauthorize"} />;
  }
  return children;
};
