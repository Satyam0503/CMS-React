import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProjectsWrapper from "./projects/ProjectsWrapper";
import ClientsWrapper from "./clients/ClientsWrapper";
const SuperAdmin = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/superadmin/projects"} />} />
        <Route path="projects" element={<ProjectsWrapper />} />
        <Route path="clients" element={<ClientsWrapper />} />
      </Route>
    </Routes>
  );
};

export default SuperAdmin;
