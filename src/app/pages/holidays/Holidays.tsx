import { Container, Grid, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";
import Holidays from "../../modules/holidays/Holidays";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <Container>
      <Typography variant="h4" my={3}>
        {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
      </Typography>
      <Holidays />
    </Container>
  );
}
