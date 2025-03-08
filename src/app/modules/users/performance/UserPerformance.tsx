import { Card, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../components/DonutApexChart";
import Feedback from "./components/Feedback";
import Achievements from "./components/Achievements";

export const UserPerformance: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container display={"flex"} gap={2.25}>
        <Card sx={{ p: 2.25, width: "100%" }}>
          <Stack mb={1}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "MENU.PERFORMANCE" })}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }}>
            <DonutApexChart
              height={150}
              series={[132, 323]}
              labels={["Present", "Holidays"]}
            />

            <DonutApexChart
              height={150}
              series={[132, 323]}
              labels={["Present", "Holidays"]}
            />

            <DonutApexChart
              height={150}
              series={[4]}
              labels={["Rating"]}
              showLabelOnHover={true}
            />
          </Stack>
        </Card>
        <Feedback />
        <Achievements />
      </Grid>
    </>
  );
};
