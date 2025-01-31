import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";

import { useUserDetails } from "./UserDataProvider";

export default function LeaveAllowences() {
  const {
    userDetails: { userSkills },
  } = useUserDetails();
  const intl = useIntl();
  const leaveAllowanceLables = ["Pending", "Taken"];
  const leaveAllowanceValue = [13, 10];

  return (
    <Card sx={{ p: 2 }} style={{ height: "100%" }}>
      <Stack
        mb={5}
        display={"flex"}
        justifyContent={"space-between"}
        flexDirection={"row"}
        alignItems={"center"}
      >
        <Typography variant="h6">
          {intl.formatMessage({ id: "MENU.LEAVE_ALLOWANCE" })}
        </Typography>
        <Typography variant="h4">4</Typography>
      </Stack>
      <DonutApexChart
        series={leaveAllowanceValue}
        labels={leaveAllowanceLables}
        showDataLabels={true}
      />
    </Card>
  );
}
