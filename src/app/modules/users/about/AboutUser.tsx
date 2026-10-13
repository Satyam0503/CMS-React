import { Grid } from "@mui/material";
import { PersonalDetails } from "./components/PersonalDetails";
import { UserEducation } from "./components/UserEducation";
import { UserCertification } from "./components/UserCertification";
import { UserSummary } from "./components/UserSummary";
import { UserSkills } from "./components/UserSkills";

export default function AboutUser() {
  return (
    <>
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        <Grid size={12}>
          <UserSummary />
        </Grid>
        <Grid size={12}>
          <PersonalDetails />
        </Grid>
        <Grid size={12}>
          <UserSkills />
        </Grid>

        <Grid size={12}>
          <UserEducation />
        </Grid>

        <Grid size={12}>
          <UserCertification />
        </Grid>
      </Grid>
    </>
  );
}
