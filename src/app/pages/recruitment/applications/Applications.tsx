import { Container, Grid, Typography } from "@mui/material";

import { useIntl } from "react-intl";

import Jobs from "../../../modules/recruitment/jobs/Jobs";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <Container>
      <Typography variant="h4" my={3}>
        {intl.formatMessage({ id: "USER.APPLICATIONS" })}
      </Typography>
      <Jobs />
    </Container>
  );
}
