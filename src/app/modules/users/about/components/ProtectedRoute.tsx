import { FC } from "react";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { Navigate } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";

interface PropsTypes {
  module?: ModulesName;
  children: React.ReactNode;
  permission?: Permission;
  adminOnly?:boolean;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module, permission = Permission.View,adminOnly=false }) => {
  const userRoleType = useAppSelector(state=>state.user.userData?.roleType!);
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  if(adminOnly){
    return userRoleType === Roles.Administrator ? children : <Navigate to={"/unauthorize"} />; 
  }else if (module && modulePermissions.length>0) {
    const hasAccess = hasModuleFeaturePermission(module, permission, modulePermissions);
    return hasAccess ? children :<Navigate to={"/unauthorize"} />; 
  }
  else{
    return <Navigate to={"/unauthorize"} />;
  }
};
