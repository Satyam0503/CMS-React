import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import { MyNotices } from "./components/MyNotices"
import { ProtectedRoute } from "../users/about/components/ProtectedRoute"
import { ModulesName, Permission } from "../../../utils/enums"
import { NoticeBoard } from "./NoticeBoard"
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble"
import { useEffect } from "react"

const noticeBoardBreadCrumbs: Array<Breadcrumb> = [
    {
        label: "PAGE.NOTICE_BOARD",
        path: "/noticeboard/notices",
        parent: "/",
    },
    {
        label: "PAGE.MY_NOTICE",
        path: "/noticeboard/notices/mynotices",
        parent: "/noticeboard/notices",
    },
];

const NoticeBoardRoutes = () => {
    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => {
        setBreadcrumbs(noticeBoardBreadCrumbs);
    }, []);
    return (
        <Routes>
            <Route element={<Outlet />} >
                <Route index element={<Navigate to="/noticeboard/notices" />} />
                <Route path="notices" element={
                    <ProtectedRoute module={ModulesName.NoticeBoard} >
                        <NoticeBoard />
                    </ProtectedRoute>
                } />
                <Route path="notices/mynotices" element={
                    <ProtectedRoute module={ModulesName.NoticeBoard} permission={Permission.Create}>
                        <MyNotices />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to={"/error/404"} />} />
            </Route>
        </Routes>
    )
}

export default NoticeBoardRoutes;