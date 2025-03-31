// import { Stack, Typography, Grid, Card } from "@mui/material";
// import { useIntl } from "react-intl";
// import { useAppSelector } from "../../Redux/hooks";
// import { useEffect, useMemo, useState } from "react";
// import { getAllEmployees } from "../employees/employeeServices";
// import { AxiosError } from "axios";
// import { AttendanceChart } from "../../shared/components/AttendanceChart";
// import { EmployeeModel } from "../../../utils/common_types";
// import { DashboardHeader } from "./components/DashboardHeader";
// import { EmployeeChart } from "./components/EmployeeChart";
// import OpenPositions from "./components/OpenPositions";
// import { ApplicationsChart } from "./components/ApplicationsChart";
// import { DepartmentChart } from "./components/DepartmentChart";
// import EmployeePerformance from "./components/EmployeePerformance";
// import EmpOnLeave from "./components/EmpOnLeave";
// import Punctual from "./components/Punctual";
// import UpcomingBirthday from "./components/UpcomingBirthday";
// import EmpOfMonth from "./components/EmpOfMonth";
// import { Help } from "@mui/icons-material";
// import { checkPermissionForModulesFeatureAccess } from "../../../utils/common";
// import { ModulesName, Permission } from "../../../utils/enums";
// import NoticeBoard from "./components/NoticeBoard";
// import { ResizableBox } from "react-resizable"; // Import ResizableBox
// import "react-resizable/css/styles.css"; // Import styles for resizable

// export default function Dashboard() {
//   const user = useAppSelector((state) => state.user.userData)!;
//   const intl = useIntl();
//   const [employees, setEmployees] = useState<EmployeeModel[]>([]);
//   const userModulesPermissions =
//     useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

//   const hasAccessToEmpModule = useMemo(
//     () =>
//       checkPermissionForModulesFeatureAccess(
//         ModulesName.Employees,
//         Permission.View,
//         userModulesPermissions
//       ),
//     [userModulesPermissions]
//   );

//   const hasAccessToJob = useMemo(
//     () =>
//       checkPermissionForModulesFeatureAccess(
//         ModulesName.Jobs,
//         Permission.View,
//         userModulesPermissions
//       ),
//     [userModulesPermissions]
//   );

//   useEffect(() => {
//     async function getEmployees() {
//       try {
//         const response = await getAllEmployees();
//         const { success, methodResults } = response.data;
//         if (success) {
//           setEmployees(methodResults);
//         }
//       } catch (error) {
//         console.error((error as AxiosError).message);
//       }
//     }
//     if (hasAccessToEmpModule) {
//       getEmployees();
//     }
//   }, [hasAccessToEmpModule]);

//   return (
//     <>
//       <DashboardHeader fullName={user.fullName} />
//       <Grid
//         container
//         spacing={3}
//         display={"flex"}
//         justifyContent={"space-between"}
//       >
//         <Grid item xs={12} lg={8}>
//           <Grid container spacing={3}>
//             {hasAccessToEmpModule && (
//               <Grid item xs={12} sm={6}>
//                 <ResizableBox
//                   width={600}
//                   height={400}
//                   minConstraints={[300, 200]}
//                   maxConstraints={[900, 600]}
//                 >
//                   <EmployeeChart employees={employees} />
//                 </ResizableBox>
//               </Grid>
//             )}

//             {hasAccessToJob && (
//               <Grid item xs={12} sm={6}>
//                 <ResizableBox
//                   width={600}
//                   height={400}
//                   minConstraints={[300, 200]}
//                   maxConstraints={[900, 600]}
//                 >
//                   <OpenPositions />
//                 </ResizableBox>
//               </Grid>
//             )}
//             {hasAccessToJob && (
//               <Grid item xs={12} sm={6}>
//                 <ResizableBox
//                   width={600}
//                   height={400}
//                   minConstraints={[300, 200]}
//                   maxConstraints={[900, 600]}
//                 >
//                   <ApplicationsChart />
//                 </ResizableBox>
//               </Grid>
//             )}
//             <Grid item xs={12} sm={6}>
//               <ResizableBox
//                 width={600}
//                 height={400}
//                 minConstraints={[300, 200]}
//                 maxConstraints={[900, 600]}
//               >
//                 <DepartmentChart employees={employees} />
//               </ResizableBox>
//             </Grid>

//             <Grid item xs={12}>
//               <Stack spacing={3}>
//                 <NoticeBoard />
//                 <EmployeePerformance />
//               </Stack>
//             </Grid>
//           </Grid>
//         </Grid>
//         <Grid item xs={12} lg={4}>
//           <Stack direction={"column"} gap={3} width={"100%"}>
//             <Card sx={{ height: "100%" }}>
//               <Stack p={2}>
//                 <Typography variant="h6">
//                   {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
//                 </Typography>

//                 <Stack
//                   direction={"row"}
//                   spacing={8}
//                   display={"flex"}
//                   justifyContent={"flex-start"}
//                   mt={1}
//                 >
//                   <Stack>
//                     <Typography variant="body2">
//                       {intl.formatMessage({ id: "ATTENDANCE.PRESENT" })}
//                     </Typography>
//                     <Typography variant="h6">185</Typography>
//                   </Stack>
//                   <Stack>
//                     <Typography variant="body2">
//                       {intl.formatMessage({ id: "ATTENDANCE.ABSENT" })}
//                     </Typography>
//                     <Typography variant="h6">16</Typography>
//                   </Stack>
//                   <Stack>
//                     <Typography variant="body2">
//                       {intl.formatMessage({ id: "ATTENDANCE.LATE" })}
//                     </Typography>
//                     <Typography variant="h6">9</Typography>
//                   </Stack>
//                 </Stack>
//               </Stack>

//               <AttendanceChart
//                 className="card-xxl-stretch "
//                 chartColor="primary"
//                 chartHeight="180px"
//               />
//             </Card>

//             <EmpOnLeave />
//             <Punctual />
//             {hasAccessToEmpModule && <UpcomingBirthday employees={employees} />}
//             <EmpOfMonth />
//             <Help />
//           </Stack>
//         </Grid>
//       </Grid>
//     </>
//   );
// }
