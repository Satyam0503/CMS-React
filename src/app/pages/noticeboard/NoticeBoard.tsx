import { Container, Grid, Typography } from "@mui/material";

import { useIntl } from "react-intl";
import DashboardUser from "../../modules/dashboard/DashboardUser";
import Holidays from "../../modules/holidays/Holidays";
import NoticeBoard from "../../modules/noticeboard/NoticeBoard";

export default function UserDashboard() {
  const intl = useIntl();
  return (
    <Container>
      <Typography variant="h4" my={3}>
        {intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
      </Typography>
      <NoticeBoard />
    </Container>
  );
}
