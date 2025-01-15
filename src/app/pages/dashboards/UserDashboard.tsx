import { Stack, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </Typography>
      <DashboardUser />
    </Stack>
  );
}
