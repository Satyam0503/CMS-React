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
    <Stack className="flex-grow-1" sx={{ gap: { xs: 2, md: 3 }, minWidth: 0 }}>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: "stretch", minWidth: 0 }}>
        <Grid
          sx={{ display: "flex", minWidth: 0 }}
          size={{
            xs: 12,
            sm: 12,
            md: 5
          }}>
          <LeaveRequestSummaryChart />
        </Grid>
        <Grid
          sx={{ display: "flex", minWidth: 0 }}
          size={{ xs: 12, md: 7 }}
        >
          <MonthlyLeaveTakenLineChart />
        </Grid>
      </Grid>
      <Stack className="flex-grow-1" sx={{ minWidth: 0 }}>
        <LeaveManagementRoutes />
      </Stack>
    </Stack>
  );
};

export default LeaveManagement;
