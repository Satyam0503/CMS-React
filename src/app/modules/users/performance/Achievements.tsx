import { Typography, Card, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Announcement,
  Celebration,
  FeedbackOutlined,
  LocalCafe,
  LocalFlorist,
  Stars,
  Whatshot,
  Work,
} from "@mui/icons-material";
import HalfRating from "../../components/HalfRating";
import { CalendarIcon } from "@mui/x-date-pickers";
import { colors } from "../../theme/MuiTheme";

type Props = {
  className: string;
};

export default function Achievements() {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ p: "15px", width: "100%" }}>
          <Typography variant="h5" sx={{ mb: "5px" }}>
            {intl.formatMessage({ id: "PERFORMANCE.ACHIEVEMENTS" })}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ opacity: ".5", mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <Whatshot sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.DIRECTOR" })}
              </Typography>
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.DIRECTOR" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ opacity: ".5", mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <Celebration sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.SR_PROJECT_MANAGER" })}
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.SR_PROJ_MANAGER" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ opacity: ".5", mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <LocalFlorist sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.PROJ_MANAGER" })}
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.PROJ_MANAGER" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ opacity: ".5", mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <Stars sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.TEAM_LEAD" })}
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.TL" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <LocalCafe sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                {intl.formatMessage({ id: "PROMOTION.SR_DEVELOPER" })}
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.SR_DEVELOPER" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: "10px" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: "12px",
              }}
            >
              <Work sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                {intl.formatMessage({ id: "PROMOTION.JOINED" })}
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.JR_DEVELOPER" })}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
