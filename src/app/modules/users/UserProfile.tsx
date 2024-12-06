import { Avatar, Box, Card, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import ProfileCard from "./ProfileCard";
import BasicTabs from "./BasicTabs";
import { toAbsoluteUrl } from "../../../_themes/helpers";

export default function UserProfile() {
  const intl = useIntl();
  return (
    <Grid container spacing={4} sx={{ maxWidth: "1200px" }} className="m-auto">
      <Grid item xs={12} md={3} className="d-flex flex-column gap-5">
        <Stack>
          <ProfileCard />
        </Stack>

        <Stack>
          <DonutApexChart />
        </Stack>
      </Grid>
      <Grid item xs={12} md={9}>
        <Stack
          direction="row"
          className="d-flex justify-content-evenly w-100 bg-white p-4 rounded "
        >
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/calender.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              
              <Typography variant="h2">14</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.EXP" })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/experience.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">6</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.EXP_CURRENT" })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/skills.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">25+</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.SKILLS_HOLDER" })}
              </Typography>
            </Box>
          </Grid>
        </Stack>
        <Stack className="w-100">
          
          <BasicTabs />
          {/* <AboutUser /> */}
        </Stack>
      </Grid>
    </Grid>
  );
}
