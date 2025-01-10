import { Container, Grid, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <Container>
      <Typography variant="h4" my={3}>
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </Typography>
      <DashboardUser />
    </Container>
  );
}
