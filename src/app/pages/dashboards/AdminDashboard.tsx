import { Container, Grid, Stack, Typography } from "@mui/material";
import DashboardMain from "../../modules/dashboard/DashboardAdmin";
import { useIntl } from "react-intl";
import DashboardAdmin from "../../modules/dashboard/DashboardAdmin";

export default function AdminDashboard() {
  const intl = useIntl();
  return (
    <Stack spacing={3}>
      <Typography variant="h4" >
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </Typography>
      <DashboardAdmin />
    </Stack>
  );
}
