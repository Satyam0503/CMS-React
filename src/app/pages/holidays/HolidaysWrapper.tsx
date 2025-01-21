import { Container, Grid, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";
import Holidays from "../../modules/holidays/Holidays";
import { CreatePassword } from "../../modules/auth/components/CreatePassword";

export default function HolidaysWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
      </Typography>
      <Holidays />
    </>
  );
}
