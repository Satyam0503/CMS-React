import { useEffect } from "react";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble"
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../utils/enums";
import { Policies } from "../modules/policies/Policies";
import { PolicyVersions } from "../modules/policies/components/PolicyVersions";


const policyBreadCrumbs: Array<Breadcrumb> = [
    {
        label: "PAGE.POLICIES",
        path: "companypolicy/policies",
        parent: "/",
    },
    {
        label: "PAGE.POLICIES",
        path: "companypolicy/policies/:policyId",
        parent: "companypolicy/policies",
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
                        <Policies />
                    </ProtectedRoute>
                } />
                <Route path="policies/:policyId" element={
                    <ProtectedRoute module={ModulesName.Policy}>
                        <PolicyVersions />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to={"/error/404"} />} />
            </Route>
        </Routes>
    )
}

export default PoliciesRoutes;