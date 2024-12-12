import { Stack, Typography, Grid, Card, Avatar } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import OpenPositions from "../components/OpenPositions";
import NoticeBoard from "./NoticeBoard";
import DynamicContent from "./DynamicContent";
import StackedBarChart from "../components/StackedBarChart";
import { toAbsoluteUrl } from "../../../_themes/helpers";

export default function DashboardMain() {
  const intl = useIntl();
  return (
    <>
      <Grid container className="d-flex justify-content-center gap-5">
        <Grid container className="d-flex justify-content-between">
          <Stack>
            <Typography variant="h2" className="mb-2">
              {intl.formatMessage({ id: "MENU.WELCOME" })} Aishwarya !
            </Typography>
            <Typography variant="body1">
              4{intl.formatMessage({ id: "NOTIFICATIONS.APPLICATIONS" })}
              <a className="text-secondary">
                {" "}
                {intl.formatMessage({ id: "LINK.NOTIFICATION" })}
              </a>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems={"center"}>
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Stack>
              {" "}
              <Typography variant="h3">Monday</Typography>
              <Typography variant="body2">25 Nov 2024</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid container spacing={3} className="d-flex justify-content-between">
          <Grid item xs={12} md={8} className="d-flex flex-column gap-6">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Grid item xs={12} sm={6} className="h-100">
                <Card className="p-5 w-100">
                  <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                    <Typography variant="h6">
                      {intl.formatMessage({ id: "MENU.TOTAL_EMP" })}
                    </Typography>
                    <Typography variant="h4">50</Typography>
                  </Stack>

                  <DonutApexChart />
                  <Stack
                    spacing={4}
                    direction="row"
                    className="my-4 d-flex justify-content-center"
                  >
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "EMP.MALE" })}
                    </Typography>
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "EMP.FEMALE" })}
                    </Typography>
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "MENU.OTHER" })}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} className="h-100">
                <OpenPositions />
              </Grid>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Grid item xs={12} md={6} className="h-100">
                <StackedBarChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className="p-5 w-100">
                  <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                    <Typography variant="h6">
                      {intl.formatMessage({ id: "MENU.DEPT" })}
                    </Typography>
                    <Typography variant="h4">4</Typography>
                  </Stack>

                  <DonutApexChart />
                  <Stack
                    spacing={2}
                    direction="row"
                    className="my-4 d-flex justify-content-center"
                  >
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "DEPT.DEVELOPMENT" })}
                    </Typography>
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "DEPT.TESTING" })}
                    </Typography>
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "DEPT.DESIGN" })}
                    </Typography>
                    <Typography variant="subtitle2">
                      {intl.formatMessage({ id: "DEPT.HR" })}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
            <Stack>
              <NoticeBoard />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <DynamicContent />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
