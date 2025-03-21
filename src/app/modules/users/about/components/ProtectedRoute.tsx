import { FC } from "react";
import { ModulesName } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { checkPermissionForModuleAndRoute } from "../../../../../utils/common";
import { Navigate } from "react-router-dom";

interface PropsTypes {
  module: ModulesName;
  children: React.ReactNode;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module }) => {
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission);
  const userModulePermissions = modulePermissions ?? [];
  const hasAccess = checkPermissionForModuleAndRoute(module, userModulePermissions);  
  if (!userModulePermissions.length) {
    return <Navigate to={"/unauthorize"}/>;
  }
  if (hasAccess) {
    return children;
  }
  return <Navigate to={"/unauthorize"}/>;
};
