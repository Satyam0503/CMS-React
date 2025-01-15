import { Stack, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </Typography>
      <DashboardUser />
    </>
  );
}
