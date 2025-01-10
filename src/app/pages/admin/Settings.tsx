import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Themes from "../../pages/admin/themes/Themes";
import { Roles } from "./permissions/Roles";
import { Container } from "@mui/material";

const SettingPage = () => {
  return (
    <Container maxWidth={"lg"}>
      <Routes>
        <Route element={<Outlet />}>
          <Route index element={<Navigate to={"/setting/permissions"} />} />
          <Route path="permissions" element={<Roles />} />
          <Route path="theme" element={<Themes />} />
        </Route>
      </Routes>
    </Container>
  );
};

export default SettingPage;
