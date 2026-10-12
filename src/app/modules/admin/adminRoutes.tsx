import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Roles } from "./permissions/Roles";
import { AddPermission } from "./permissions/components/AddPermission";
import { EditPermission } from "./permissions/components/EditPermission";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { CompanyMasterTab } from "./companymaster/CompanyMaster";
import { useEffect, useState } from "react";
import { CompanyDetailsTab } from './companydetails/CompanyDetails'
import { useNavigate } from 'react-router-dom';
import { getRecruitmentReadiness } from '../recruitment/services';

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

const AdminLanding = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getRecruitmentReadiness()
      .then(({ data }) => {
        if (!active) return;
        const requiredIncomplete = data.success && (data.methodResult?.required ?? []).some((item) => !item.complete);
        navigate(requiredIncomplete ? "/admin/companydetails/recruitment-readiness" : "/admin/roles", { replace: true });
      })
      .catch(() => {
        if (active) navigate("/admin/roles", { replace: true });
      })
      .finally(() => active && setChecking(false));
    return () => { active = false; };
  }, [navigate]);

  return checking ? null : null;
};
const AdminRoutes = () => {
  const {setBreadcrumbs}= useBreadcrumbs();
  useEffect(()=>{
    setBreadcrumbs(adminBreadcrumbs);
  },[setBreadcrumbs]);
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<AdminLanding />} />
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
