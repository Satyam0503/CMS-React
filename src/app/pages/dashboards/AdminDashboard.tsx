import { Container, Grid, Typography } from "@mui/material";
import DashboardMain from "../../modules/dashboard/DashboardAdmin";
import { useIntl } from "react-intl";
import DashboardAdmin from "../../modules/dashboard/DashboardAdmin";

export default function AdminDashboard() {
  const intl = useIntl();
  return (
    <Container>
      <Typography variant="h4" my={3}>
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </Typography>
      <DashboardAdmin />
    </Container>
  );
}
