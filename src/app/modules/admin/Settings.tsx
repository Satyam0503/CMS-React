import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Themes from "./themes/Themes";
import { Roles } from "./permissions/Roles";
import { ProtectedRoute } from "../users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";
import { AddPermission } from "./permissions/components/AddPermission";
import { EditPermission } from "./permissions/components/EditPermission";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { CompanyMaster } from "./companymaster/CompanyMaster";
import { useEffect } from "react";

const adminBreadcrumbs:Array<Breadcrumb> = [
  {
    label: "PAGE.PERMISSION",
    path: "/admin/permissions",
    parent: "/",
  },
  {
    label: "PAGE.THEME",
    path: "/admin/theme",
    parent: "/",
  },
  {
    label: "PAGE.EDIT_PERMISSION",
    path: "/admin/editpermission",
    parent: "/admin/permissions",
  },
  {
    label: "PAGE.ADD_ROLE",
    path: "/admin/addrole",
    parent: "/admin/permissions",
  },
  {
    label: "PAGE.COMPANY_MASTER",
    path: "/admin/companymaster",
    parent: "/",
  },
] 

const SettingPage = () => {
  const {setBreadcrumbs}= useBreadcrumbs();
  useEffect(()=>{
    setBreadcrumbs(adminBreadcrumbs);
  },[]);
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/admin/roles"} />} />
        <Route
          path="roles"
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
          path="roles/edit/:id"
          element={
            <ProtectedRoute module={ModulesName.Permissions}>
              <EditPermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles/add"
          element={
            <ProtectedRoute module={ModulesName.Permissions}>
              <AddPermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="companymaster"
          element={
            <ProtectedRoute module={ModulesName.CompanyMaster}>
              <CompanyMaster />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default SettingPage;
