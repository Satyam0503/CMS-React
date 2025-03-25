import { Box, CardContent, Grid, Stack, Typography } from "@mui/material";

import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
} from "@mui/icons-material";

import { useIntl } from "react-intl";

import { useLocation, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../Redux/hooks";
import { EmployeeModel } from "../../../../../utils/common_types";
import { getEmployeeById, getEmployeeSkills } from "../../userservices";
import { EmployeeProfileCard } from "./EmployeeProfileCard";
import LeaveAllowences from "../../components/LeaveAllowences";
import { colors } from "../../../theme/MuiTheme";
import IconStat from "../../../../shared/components/IconStat";
import { getDateDiffInYears } from "../../../../../utils/common";
import BasicTabs from "./BasicTabs";
import { AboutEmployee } from "./AboutEmployee";
import { EmployeeDetails } from "./EmployeeDetails";
import { EmployeeSkills } from "./EmployeeSkills";
import { EmployeeEducation } from "./EmployeeEducation";
import { EmployeeCertification } from "./EmployeeCertifications";

const AboutEmployeeMain = () => {
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
      <Grid container display={"flex"} gap={2} mt={1}>
        <Grid item xs={12}>
          <AboutEmployee employeeId={employeeId} />
        </Grid>
        <Grid item xs={12}>
          <EmployeeDetails employeeDetails={employeeDetails} />
        </Grid>
        <Grid item xs={12}>
          <EmployeeSkills employeeSkills={employeeSkills} />
        </Grid>

        <Grid item xs={12}>
          <EmployeeEducation employeeId={employeeId} />
        </Grid>

        <Grid item xs={12}>
          <EmployeeCertification employeeId={employeeId} />
        </Grid>
      </Grid>
    </>
  );
};

export { AboutEmployeeMain };
