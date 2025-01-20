import { Navigate, Outlet, Route, Routes } from "react-router-dom";

export const EmployeesRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/employees/#"} />} />
      </Route>
    </Routes>
  );
};
