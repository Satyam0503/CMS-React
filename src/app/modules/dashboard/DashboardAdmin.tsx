import {
  Stack,
  Typography,
  Grid,
  Card,
} from "@mui/material";
import { useIntl } from "react-intl";
import OpenPositions from "./components/OpenPositions";
import NoticeBoard from "./components/NoticeBoard";
import EmpOnLeave from "./components/EmpOnLeave";
import Punctual from "./components/Punctual";
import UpcomingBirthday from "./components/UpcomingBirthday";
import EmpOfMonth from "./components/EmpOfMonth";
import Help from "./components/Help";
import { AttendanceChart } from "../components/AttendanceChart";
import EmployeePerformance from "./components/EmployeePerformance";
import { useAppSelector } from "../../Redux/hooks";
import { DashboardHeader } from "./components/DashboardHeader";
import { EmployeeChart } from "./components/EmployeeChart";
import { ApplicationsChart } from "./components/ApplicationsChart";
import { useEffect, useState } from "react";
import { getAllEmployees } from "../employees/components/employeeServices";
import { EmployeeModel } from "../../../utils/common_types";
import { AxiosError } from "axios";
import { DepartmentChart } from "./components/DepartmentChart";

export default function DashboardAdmin() {
  const user = useAppSelector((state) => state.user.userData)!;
  const intl = useIntl();
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);

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
            <Grid item xs={12} sm={6}>
              <EmployeeChart employees={employees}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <OpenPositions />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ApplicationsChart />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DepartmentChart employees={employees}/>
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
            <Card sx={{ height: "100%" }}>
              <Stack p={2}>
                <Typography variant="h6">
                  {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
                </Typography>

                <Stack
                  direction={"row"}
                  spacing={8}
                  display={"flex"}
                  justifyContent={"flex-start"}
                  mt={1}
                >
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.PRESENT" })}
                    </Typography>
                    <Typography variant="h6">185</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.ABSENT" })}
                    </Typography>
                    <Typography variant="h6">16</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.LATE" })}
                    </Typography>
                    <Typography variant="h6">9</Typography>
                  </Stack>
                </Stack>
              </Stack>

              <AttendanceChart
                className="card-xxl-stretch "
                chartColor="primary"
                chartHeight="180px"
              />
            </Card>

            <EmpOnLeave />
            <Punctual />
            <UpcomingBirthday employees={employees} />
            <EmpOfMonth />
            <Help />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
