import { Navigate, Route, Routes } from "react-router-dom";
import { Registration } from "./components/Registration";
import { ForgotPassword } from "./components/ForgotPassword";
import { Login } from "./components/Login";
import { AuthLayout } from "./AuthLayout";
import { CreatePassword } from "./components/CreatePassword";

const AuthPage = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="createpassword" element={<CreatePassword />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route index element={<Login />} />
        <Route path="*" element={<Navigate to={"/auth"} />} />
      </Route>
    </Routes>
  )
}

export { AuthPage };
