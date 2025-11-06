import * as React from "react";
import {
  Grid,
  Stack,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import { LeaveManagementRoutes } from "../../routing/LeaveManagementRoutes";
import { usePageData } from "../../Context/PageDataProvider";
import { LeaveRequestSummaryChart } from "./components/LeaveRequestSummaryChart";
import { MonthlyLeaveTakenLineChart } from "./components/MonthlyLeaveTakenLineChart";

const LeaveManagement: FC = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  React.useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.LEAVE_MANAGEMENT" }));
  }, []);

  return (
    <Stack className="gap-4 flex-grow-1">
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid
          sx={{ display: "flex" }}
          size={{
            xs: 12,
            sm: 12,
            md: 5
          }}>
          <LeaveRequestSummaryChart />
        </Grid>
        <Grid
          sx={{ display: "flex" }}
          size="grow"
        >
          <MonthlyLeaveTakenLineChart />
        </Grid>
      </Grid>
      <Stack className="flex-grow-1">
        <LeaveManagementRoutes />
      </Stack>
    </Stack>
  );
};

export default LeaveManagement;
