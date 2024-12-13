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
          <Typography variant="h5" className="mb-3">
            {intl.formatMessage({ id: "MENU.PERFORMANCE" })}
          </Typography>
          <Stack
            direction="row"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Stack>
            <DonutApexChart series={[132,323]} labels={['Present','Holidays']} />
              <Stack
                spacing={4}
                direction="row"
                className="my-4 d-flex justify-content-center"
              >
                <Typography variant="subtitle2">222/300</Typography>
              </Stack>
            </Stack>
            <Stack>
            <DonutApexChart series={[132,323]} labels={['Present','Holidays']} />
            </Stack>
            <Stack>
              <DonutApexChart series={[4]} labels={['Rating']} showLabelOnHover={true}/>
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
