import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import Themes from "../../pages/admin/themes/Themes"
import Admin from "../../pages/admin/permissions/Admin"

const SettingPage = () => {
    return (
        <Routes>
            <Route
                element={
                    <Outlet />
                }
            >
                <Route index element={<Navigate to={"/setting/permissions"}/>} />
                <Route
                    path="permissions"
                    element={ <Admin/> }
                />
                <Route
                    path="theme"
                    element={ <Themes/> }
                />
            </Route>
        </Routes>
    )
}

export default SettingPage;