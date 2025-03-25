import { Box, CardContent, Grid, Stack, Typography } from "@mui/material";

import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
} from "@mui/icons-material";

import { useIntl } from "react-intl";
import { useAppSelector } from "../../../Redux/hooks";
import { colors } from "../../theme/MuiTheme";
import IconStat from "../../../shared/components/IconStat";
import { getDateDiffInYears } from "../../../../utils/common";
import { EmployeeSkills } from "./components/EmployeeSkills";
import { EmployeeCertification } from "./components/EmployeeCertifications";
import { EmployeeEducation } from "./components/EmployeeEducation";
import { AboutEmployee } from "./components/AboutEmployee";
import { EmployeeDetails } from "./components/EmployeeDetails";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileCard } from "./components/EmployeeProfileCard";
import { EmployeeModel } from "../../../../utils/common_types";
import { useEffect, useState } from "react";
import { getEmployeeById, getEmployeeSkills } from "../userservices";
import LeaveAllowences from "../components/LeaveAllowences";
import BasicTabs from "./components/BasicTabs";

const EmployeeProfile = () => {
  const intl = useIntl();
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeModel>(
    {} as EmployeeModel
  );
  const [employeeSkills, setEmployeeSkills] = useState<string>("");

  const companyName = useAppSelector(
    (state) => state.user.userData?.companyName
  );
  const location = useLocation();
  const navigate = useNavigate();
  const employeeId = location.state as string;
  if (!employeeId) {
    navigate("/error");
  }

  useEffect(() => {
    const getEmployeeDetails = async () => {
      try {
        const response = await Promise.allSettled([
          getEmployeeById(employeeId),
          getEmployeeSkills(employeeId),
        ]);
        const empData =
          response[0].status === "fulfilled"
            ? response[0].value.data.methodResult
            : ({} as EmployeeModel);
        setEmployeeDetails(empData);
        const empSkills =
          response[1].status === "fulfilled"
            ? response[1].value.data.methodResult.skills
            : "";
        setEmployeeSkills(empSkills);
      } catch (error) {
        console.log(error);
      }
    };
    getEmployeeDetails();
  }, []);

  return (
    <>
      {/* //need to add user name in place of my */}
      <Stack position={{ lg: "sticky" }} top={{ lg: 80 }}>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "MENU.PROFILE" })}
        </Typography>
      </Stack>
      <Grid container spacing={4}>
        <Grid
          item
          xs={12}
          lg={3.8}
          xl={3}
          display={"flex"}
          flexDirection={{ xs: "column", sm: "row", lg: "column" }}
          gap={{ xs: 4, sm: 2, md: 4 }}
          justifyContent={{ lg: "flex-start" }}
          position={{ xs: "inherit", lg: "sticky" }}
          top={{ lg: 100 }}
          height={{ lg: "60vh" }}
        >
          <Stack width={"100%"}>
            <EmployeeProfileCard employeeDetails={employeeDetails} />
          </Stack>
          <Stack width={"100%"}>
            <LeaveAllowences />
          </Stack>
        </Grid>
        <Grid item xs={12} md={12} lg={8.2} xl={9}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            display={"flex"}
            justifyContent={"center"}
            bgcolor={colors.alpha.white[500]}
            borderRadius={1}
          >
            <Grid item xs={12} sm={4}>
              <Box component={CardContent}>
                <IconStat
                  iconBg={colors.alpha.secondary[100]}
                  icon={<CalendarMonth fontSize="large" />}
                  iconColor={colors.alpha.secondary[500]}
                  number={14}
                  title="Years of experience"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box component={CardContent}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<CorporateFareOutlined fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                  number={getDateDiffInYears(employeeDetails.dateOfJoining!)}
                  title={`Years in ${companyName}`}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box component={CardContent}>
                <IconStat
                  iconBg={colors.alpha.danger[100]}
                  icon={<Build fontSize="large" />}
                  iconColor={colors.alpha.danger[400]}
                  number={
                    employeeSkills.trim().length === 0
                      ? 0
                      : employeeSkills.split(",").length
                  }
                  title="Skills holder"
                />
              </Box>
            </Grid>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            <BasicTabs />
          </Stack>
          {/* <Stack spacing={2} sx={{ my: 2 }}>
            <AboutEmployee employeeId={employeeId} />
            <EmployeeDetails employeeDetails={employeeDetails} />
            <EmployeeSkills employeeSkills={employeeSkills} />
            <EmployeeEducation employeeId={employeeId} />
            <EmployeeCertification employeeId={employeeId} />
          </Stack> */}
        </Grid>
      </Grid>
    </>
  );
};

export { EmployeeProfile };
