import { Card, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../components/DonutApexChart";
import Feedback from "./Feedback";
import Achievements from "./Achievements";

export const UserPerformance: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container className="d-flex gap-4">
        <Card className="p-5">
          <Typography variant="h5">
            {intl.formatMessage({ id: "MENU.PERFORMANCE" })}
          </Typography>
          <Stack
            direction="row"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Stack>
              <DonutApexChart />
              <Stack
                spacing={4}
                direction="row"
                className="my-4 d-flex justify-content-center"
              >
                <Typography variant="subtitle2">222/300</Typography>
              </Stack>
            </Stack>
            <Stack>
              <DonutApexChart />
              <Stack
                spacing={4}
                direction="row"
                className="my-4 d-flex justify-content-center"
              >
                <Typography variant="subtitle2">
                  {intl.formatMessage({ id: "ATTENDANCE.PRESENT" })}
                </Typography>
                <Typography variant="subtitle2">
                  {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
                </Typography>
              </Stack>
            </Stack>
            <Stack>
              <DonutApexChart />
              <Stack
                spacing={4}
                direction="row"
                className="my-4 d-flex justify-content-center"
              >
                <Typography variant="subtitle2">
                  {intl.formatMessage({ id: "PERFORMANCE.V_GOOD" })}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
        <Feedback />
        <Achievements />
      </Grid>
    </>
  );
};
