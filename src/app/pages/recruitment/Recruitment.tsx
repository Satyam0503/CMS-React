import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Jobs from "./jobs/Jobs";
import Applications from "./applications/Applications";

const Recruitment = () =>{
  return (
    <Routes>
      <Route
        element={<Outlet/>}
      >
        <Route index element={<Navigate to={"/recruitment/jobs"}/>}/>
        <Route path="jobs" element={<Jobs/>}/>
        <Route path="applications" element={<Applications/>} />
      </Route>
    </Routes>
  );
}

export default Recruitment;