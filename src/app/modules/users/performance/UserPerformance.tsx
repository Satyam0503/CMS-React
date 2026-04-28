import { Card, Grid, Stack, Typography } from "@mui/material";
import { FC, Suspense, lazy } from "react";

import { useIntl } from "react-intl";

const DonutApexChart = lazy(
  () => import("../../../shared/components/DonutApexChart")
);
const Feedback = lazy(() => import("./components/Feedback"));
const Achievements = lazy(() => import("./components/Achievements"));

export const UserPerformance: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          gap: 2.25
        }}>
        <Card sx={{ p: 2.25, width: "100%" }}>
          <Stack sx={{
            mb: 1
          }}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "MENU.PERFORMANCE" })}
            </Typography>
          </Stack>

          <Suspense fallback={null}>
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
          </Suspense>
        </Card>
        <Suspense fallback={null}>
          <Feedback />
          <Achievements />
        </Suspense>
      </Grid>
    </>
  );
};
