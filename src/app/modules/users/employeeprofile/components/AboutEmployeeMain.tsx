import {  Grid } from "@mui/material";


import { useIntl } from "react-intl";

import {  useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../Redux/hooks";
import { EmployeeModel } from "../../../../../utils/common_types";
import { getEmployeeById, getEmployeeSkills } from "../../userservices";
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
  const navigate = useNavigate();
  const param = useParams();

  if (Object.keys(param).length === 0 || !param.employeeid) {
    navigate("/error", { replace: true });
  }
  const employeeId = param.employeeid ?? "";

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
