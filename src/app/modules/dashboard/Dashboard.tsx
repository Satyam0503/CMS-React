import { Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../Redux/hooks";
import React, { useMemo, useState } from "react";
import { AttendanceChart } from "../../shared/components/AttendanceChart";
import { EmployeeChart } from "./components/EmployeeChart";
import OpenPositions from "./components/OpenPositions";
import { ApplicationsChart } from "./components/ApplicationsChart";
import { DepartmentChart } from "./components/DepartmentChart";
import EmployeePerformance from "./components/EmployeePerformance";
import EmpOnLeave from "./components/EmpOnLeave";
import Punctual from "./components/Punctual";
import EmpOfMonth from "./components/EmpOfMonth";
import NoticeBoard from "./components/NoticeBoard";
import Help from "./components/Help";
import { checkPermissionForModulesFeatureAccess } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { DashboardHeader } from "./components/DashboardHeader";
import { usePageData } from "../../../_themes/layout/core";
import { GetAllEmployeeResponseModel } from "../employees/models";

// Main Dashboard Component
export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData)!;
  const intl = useIntl();

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
    setPageTitle("");
  }, [])

  return (
    <React.Fragment>
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
                {/* <EmployeeChart employees={employees} /> */}
                <EmployeeChart />
                <EmployeeChart />
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
              {/* <DepartmentChart employees={employees} /> */}
              <DepartmentChart />

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
    </React.Fragment>
  );
}
