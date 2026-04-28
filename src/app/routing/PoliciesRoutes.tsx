import { lazy, Suspense, useEffect } from "react";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble"
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../utils/enums";

const Policies = lazy(() =>
  import("../modules/policies/Policies").then((module) => ({
    default: module.Policies,
  }))
);
const PolicyVersions = lazy(() =>
  import("../modules/policies/components/PolicyVersions").then((module) => ({
    default: module.PolicyVersions,
  }))
);

const SuspensedView = ({ children }: { children: JSX.Element }) => {
  return <Suspense fallback={null}>{children}</Suspense>;
};


const policyBreadCrumbs: Array<Breadcrumb> = [
    {
        label: "PAGE.POLICIES",
        path: "/companypolicy/policies",
        parent: "/",
    },
    {
        label: "POLICIES.DOCUMENT",
        path: "/companypolicy/policies/{policyId}",
        parent: "/companypolicy/policies",
    },
];

const PoliciesRoutes = () => {
    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => {
        setBreadcrumbs(policyBreadCrumbs);
    }, []);
    return (
        <Routes>
            <Route element={<Outlet />} >
                <Route index element={<Navigate to="/companypolicy/policies" />} />
                <Route path="policies" element={
                    <ProtectedRoute module={ModulesName.Policy}>
                        <SuspensedView>
                            <Policies />
                        </SuspensedView>
                    </ProtectedRoute>
                } />
                <Route path="policies/:policyId" element={
                    <ProtectedRoute module={ModulesName.Policy}>
                        <SuspensedView>
                            <PolicyVersions />
                        </SuspensedView>
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to={"/error/404"} />} />
            </Route>
        </Routes>
    )
}

export default PoliciesRoutes;