import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Themes from "./themes/Themes";
import { Roles } from "./permissions/Roles";
import { EditPermission } from "./permissions/EditPermission";
import { ProtectedRoute } from "../users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";

const SettingPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/admin/permissions"} />} />
        <Route
          path="permissions"
          element={
            <ProtectedRoute module={ModulesName.Permissions}>
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="theme"
          element={
            <ProtectedRoute module={ModulesName.Theme}>
              <Themes />
            </ProtectedRoute>
          }
        />
        <Route
          path="editpermission"
          element={
            <ProtectedRoute module={ModulesName.Permissions}>
              <EditPermission />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default SettingPage;
