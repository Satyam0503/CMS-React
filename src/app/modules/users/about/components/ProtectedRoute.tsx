import { FC } from "react";
import { ModulesName } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { Typography } from "@mui/material";
import { checkUserPermissionForRouteAccess } from "../../../../../utils/common";

interface PropsTypes {
  module: ModulesName;
  children: React.ReactNode;
}

export const ProtectedRoute: FC<PropsTypes> = ({ children, module }) => {
  const userPermissions = useAppSelector((state) => state.user.userPermissions);
  const hasAccess = checkUserPermissionForRouteAccess(module, userPermissions);
  if (!userPermissions.length) {
    return <Typography>You Don't Have Access To This Page</Typography>;
  }
  if (hasAccess) {
    return children;
  }
  return <Typography>You Don't Have Access To This Page</Typography>;
};
