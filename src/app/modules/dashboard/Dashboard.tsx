import { Grid, Stack, Typography, Card } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../Redux/hooks";
import { useEffect, useMemo, useState } from "react";
import { getAllEmployees } from "../employees/employeeServices";
import { AxiosError } from "axios";
import { AttendanceChart } from "../../shared/components/AttendanceChart";
import { EmployeeChart } from "./components/EmployeeChart";
import OpenPositions from "./components/OpenPositions";
import { ApplicationsChart } from "./components/ApplicationsChart";
import { DepartmentChart } from "./components/DepartmentChart";
import EmployeePerformance from "./components/EmployeePerformance";
import EmpOnLeave from "./components/EmpOnLeave";
import Punctual from "./components/Punctual";
import UpcomingBirthday from "./components/UpcomingBirthday";
import EmpOfMonth from "./components/EmpOfMonth";
import { EmployeeModel } from "../../../utils/common_types";
import NoticeBoard from "./components/NoticeBoard";
import Help from "./components/Help";
import { checkPermissionForModulesFeatureAccess } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { DashboardHeader } from "./components/DashboardHeader";
import RightDrawer from "./components/RightDrawer";
import { usePageData } from "../../../_themes/layout/core";
import { GetAllEmployeeResponseModel } from "../employees/models";

// Main Dashboard Component
export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData)!;
  const intl = useIntl();
  const [employees, setEmployees] = useState<GetAllEmployeeResponseModel[]>([]);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const hasAccessToEmpModule = useMemo(
    () =>
      checkPermissionForModulesFeatureAccess(
        `${ModulesName.Employees}.${Permission.View}`,
        userModulesPermissions
      ),
    [userModulesPermissions]
  );

  const hasAccessToJob = useMemo(
    () =>
      checkPermissionForModulesFeatureAccess(
        `${ModulesName.Jobs}.${Permission.View}`,
        userModulesPermissions
      ),
    [userModulesPermissions]
  );

  useEffect(() => {
    async function getEmployees() {
      try {
        const response = await getAllEmployees();
        const { success, methodResults } = response.data;
        if (success) {
          setEmployees(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
    setPageTitle("");
    getEmployees();
  }, []);

  return (
    <>
      <DashboardHeader fullName={user.fullName} />

      <Grid
        container
        spacing={3}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {hasAccessToEmpModule && (
              <Grid item xs={12} sm={6}>
                <EmployeeChart employees={employees} />
              </Grid>
            )}
            {hasAccessToJob && (
              <Grid item xs={12} sm={6}>
                <OpenPositions />
              </Grid>
            )}
            {hasAccessToJob && (
              <Grid item xs={12} sm={6}>
                <ApplicationsChart />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <DepartmentChart employees={employees} />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={3}>
                <NoticeBoard />
                <EmployeePerformance />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack direction={"column"} gap={3} width={"100%"}>
            <AttendanceChart
              className="card-xxl-stretch"
              chartColor="primary"
              chartHeight="180px"
            />
            <EmpOnLeave />
            <Punctual />
            {/* {hasAccessToEmpModule && <UpcomingBirthday employees={employees} />} */}
            <EmpOfMonth />
            <Help />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
