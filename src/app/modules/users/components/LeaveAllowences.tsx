import { Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../../../shared/components/DonutApexChart";

export default function LeaveAllowences() {
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
        <Typography variant="h4" sx={{ fontSize: 16 }}>
          {intl.formatMessage({ id: "MENU.LEAVE_ALLOWANCE" })}
        </Typography>
        <Typography variant="h4">4</Typography>
      </Stack>
      <DonutApexChart
        series={leaveAllowanceValue}
        labels={leaveAllowanceLables}
      />
    </Card>
  );
}
