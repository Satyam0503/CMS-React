import { Grid } from "@mui/material";
import { useIntl } from "react-intl";
import { useUserDetails } from "../UserDataProvider";
import { useEffect, useState } from "react";

import {
  EmployeeModel,
  UserCertificationModel,
  UserEducationModel,
} from "../../../../utils/common_types";

import { useAppSelector } from "../../../Redux/hooks";
import { PersonalDetails } from "./components/PersonalDetails";
import { UserEducation } from "./components/UserEducation";
import { UserCertification } from "./components/UserCertification";
import { UserSummary } from "./components/UserSummary";
import { UserSkills } from "./components/UserSkills";
import {
  getEmployeeCertifications,
  getEmployeeDetails,
  getEmployeeEducations,
  getEmployeeSkills,
  getEmployeeSummary,
  UserSummaryModel,
} from "../userservices";
import { toast } from "react-toastify";

export default function AboutUser() {
  const token = useAppSelector((state) => state.auth.token)!;
  const [refresh, setRefresh] = useState(false);
  const [userEducations, setUserEducations] = useState<UserEducationModel[]>(
    []
  );
  const [userCertifications, setUserCertifications] = useState<
    UserCertificationModel[]
  >([]);
  const [userSummary, setUserSummary] = useState<UserSummaryModel>({
    summaryId: "",
    summary: "",
  });
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userPersonalDetails, setUserPersonalDetails] = useState<EmployeeModel>(
    {} as EmployeeModel
  );

  useEffect(() => {
    const getAllDetails = async () => {
      try {
        const responseArray = await Promise.all([
          getEmployeeCertifications(token),
          getEmployeeEducations(token),
          getEmployeeSummary(token),
          getEmployeeDetails(token),
          // getEmployeeSkills(token),
        ]);
        setUserCertifications(responseArray[0].data.methodResults);
        setUserEducations(responseArray[1].data.methodResults);
        setUserSummary(responseArray[2].data.methodResult);
        setUserPersonalDetails(responseArray[3].data.methodResult);
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    getAllDetails();
  }, [refresh]);

  console.log("render");

  return (
    <>
      <Grid container display={"flex"} gap={2} mt={1}>
        <Grid item xs={12}>
          <UserSummary userSummary={userSummary} />
        </Grid>
        <Grid item xs={12}>
          <PersonalDetails userPersonalDetails={userPersonalDetails} />
        </Grid>
        <Grid item xs={12}>
          <UserSkills skills={userSkills} />
        </Grid>

        <Grid item xs={12}>
          <UserEducation userEducations={userEducations} />
        </Grid>

        <Grid item xs={12}>
          <UserCertification userCertifications={userCertifications} />
        </Grid>
      </Grid>
    </>
  );
}
