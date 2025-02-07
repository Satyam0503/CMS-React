import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Themes from "../../pages/admin/themes/Themes";
import { Roles } from "./permissions/Roles";
import { EditPermission } from "./permissions/EditPermission";

const SettingPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/admin/permissions"} />} />
        <Route path="permissions" element={<Roles />} />
        <Route path="theme" element={<Themes />} />
        <Route path="editpermission" element={<EditPermission />} />
      </Route>
    </Routes>
  );
};

export default SettingPage;
