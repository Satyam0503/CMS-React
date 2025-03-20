import { Grid } from "@mui/material";
import { PersonalDetails } from "./components/PersonalDetails";

export default function AboutUser() {
  return (
    <>
      <Grid container display={"flex"} gap={2} mt={1}>
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
