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
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableComponent } from "./DraggableComponent";
import { EmployeeModel } from "../../../utils/common_types";
import NoticeBoard from "./components/NoticeBoard";
import Help from "./components/Help";
import { checkPermissionForModulesFeatureAccess } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { DashboardHeader } from "./components/DashboardHeader";

// Main Dashboard Component
export default function Dashboard() {
  const user = useAppSelector((state) => state.user.userData)!;
  const intl = useIntl();
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [layout, setLayout] = useState<string[]>([
    "employees",
    "open-positions",
    "applications-chart",
    "department-chart",
    "notice-board",
    "emp-performance",
    "attendancechart",
    "Emponleave",
    "Punctual",
    "upcomingbirthday",
    "empofmonth",
    "help",
  ]);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const hasAccessToEmpModule = useMemo(
    () =>
      checkPermissionForModulesFeatureAccess(
        ModulesName.Employees,
        Permission.View,
        userModulesPermissions
      ),
    [userModulesPermissions]
  );

  const hasAccessToJob = useMemo(
    () =>
      checkPermissionForModulesFeatureAccess(
        ModulesName.Jobs,
        Permission.View,
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
    getEmployees();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layout.indexOf(active.id);
      const newIndex = layout.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedLayout = Array.from(layout);
        updatedLayout.splice(oldIndex, 1);
        updatedLayout.splice(newIndex, 0, active.id);
        setLayout(updatedLayout);
      }
    }
  };

  return (
    <>
      <DashboardHeader fullName={user.fullName} />
      <DndContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {layout.map((id) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <DraggableComponent id={id}>
                {id === "employees" && <EmployeeChart employees={employees} />}
                {id === "open-positions" && <OpenPositions />}
                {id === "applications-chart" && <ApplicationsChart />}
                {id === "department-chart" && (
                  <DepartmentChart employees={employees} />
                )}
                {id === "notice-board" && <NoticeBoard />}
                {id === "emp-performance" && <EmployeePerformance />}
                {id === "attendancechart" && (
                  <AttendanceChart
                    className="card-xxl-stretch"
                    chartColor="primary"
                    chartHeight="200px"
                  />
                )}
                {id === "Emponleave" && <EmpOnLeave />}
                {id === "Punctual" && <Punctual />}
                {id === "upcomingbirthday" && (
                  <UpcomingBirthday employees={employees} />
                )}
                {id === "empofmonth" && <EmpOfMonth />}
                {id === "help" && <Help />}
              </DraggableComponent>
            </Grid>
          ))}
        </Grid>
      </DndContext>
    </>
  );
}
