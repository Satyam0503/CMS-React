import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Roles } from "./permissions/Roles";
import { AddPermission } from "./permissions/components/AddPermission";
import { EditPermission } from "./permissions/components/EditPermission";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { CompanyMasterTab } from "./companymaster/CompanyMaster";
import { useEffect } from "react";
import { CompanyDetailsTab } from './companydetails/CompanyDetails'

const adminBreadcrumbs:Array<Breadcrumb> = [
  {
    label: "PAGE.PERMISSION",
    path: "/admin/roles",
    parent: "/",
  },
  {
    label: "PAGE.EDIT_PERMISSION",
    path: "/admin/roles/edit/{id}",
    parent: "/admin/roles",
  },
  {
    label: "PAGE.ADD_ROLE",
    path: "/admin/roles/add",
    parent: "/admin/roles",
  },
  {
    label: "PAGE.COMPANY_MASTER",
    path: "/admin/companymaster",
    parent: "/",
  },
  {
    label: "PAGE.COMPANY_DETAILS",
    path: "/admin/companydetails",
    parent: "/",
  },
] 
const AdminRoutes = () => {
  const {setBreadcrumbs}= useBreadcrumbs();
  useEffect(()=>{
    setBreadcrumbs(adminBreadcrumbs);
  },[setBreadcrumbs]);
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to="roles" replace />} />
        <Route
          path="roles"
          element={<Roles />}
        />
        <Route
          path="roles/edit/:roleid"
          element={<EditPermission /> }
        />
        <Route
          path="roles/add"
          element={<AddPermission />}
        />
        <Route
          path="companymaster/*"
          element={<CompanyMasterTab />}
        />
        <Route
          path="companydetails/*"
          element={<CompanyDetailsTab />}
        />
      </Route>
      <Route path="*" element={<Navigate to={"/error"}/>} />
    </Routes>
  );
};

export default AdminRoutes;
