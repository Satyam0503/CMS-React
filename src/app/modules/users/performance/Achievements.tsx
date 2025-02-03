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
        <Card
          sx={{
            p: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Stack>
            <Typography variant="h5" mb={1}>
              {intl.formatMessage({ id: "PERFORMANCE.ACHIEVEMENTS" })}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ opacity: ".5" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Whatshot />
              </Stack>
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
            sx={{ opacity: ".5" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Celebration />
              </Stack>
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
            sx={{ opacity: ".5" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <LocalFlorist />
              </Stack>
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
            sx={{ opacity: ".5" }}
            alignItems={"center"}
          >
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Stars />
              </Stack>
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
          <Stack direction="row" spacing={2} alignItems={"center"}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <LocalCafe />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
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
          <Stack direction="row" spacing={2} alignItems={"center"}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Work />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
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
