import { Grid } from "@mui/material";
import { PersonalDetails } from "./components/PersonalDetails";
import { UserEducation } from "./components/UserEducation";
import { UserCertification } from "./components/UserCertification";
import { UserSummary } from "./components/UserSummary";
import { UserSkills } from "./components/UserSkills";

export default function AboutUser() {
  return (
    <>
      <Grid container display={"flex"} gap={2}>
        <Grid item xs={12}>
          <UserSummary />
        </Grid>
        <Grid item xs={12}>
          <PersonalDetails />
        </Grid>
        <Grid item xs={12}>
          <UserSkills />
        </Grid>

        <Grid item xs={12}>
          <UserEducation />
        </Grid>

        <Grid item xs={12}>
          <UserCertification />
        </Grid>
      </Grid>
    </>
  );
}
