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
  // Administrators bypass module permission checks and always have access
  if (userRoleType === Roles.Administrator) {
    return <>{children}</>;
  }

  if(adminOnly){
    return userRoleType === Roles.Administrator ? children : <Navigate to={"/unauthorize"} replace />;
  } else if (module && modulePermissions.length>0) {
    const hasAccess = permissions?.length
      ? permissions.some((perm) => hasModuleFeaturePermission(module, perm, modulePermissions))
      : hasModuleFeaturePermission(module, permission, modulePermissions);
    return hasAccess ? children : <Navigate to={"/unauthorize"} replace />;
  }
  else{
    return <Navigate to={"/unauthorize"} replace />;
  }
};
