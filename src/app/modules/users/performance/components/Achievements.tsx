import { Typography, Card, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  CalendarToday,
  Celebration,
  LocalCafe,
  LocalFlorist,
  Stars,
  Whatshot,
  Work,
} from "@mui/icons-material";

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
            <Typography variant="h5" sx={{
              mb: 1
            }}>
              {intl.formatMessage({ id: "PERFORMANCE.ACHIEVEMENTS" })}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              opacity: ".5"
            }}>
            <Stack
              sx={{
                minWidth: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <Whatshot />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.DIRECTOR" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.DIRECTOR" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              opacity: ".5"
            }}>
            <Stack
              sx={{
                minWidth: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <Celebration />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.SR_PROJECT_MANAGER" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.SR_PROJ_MANAGER" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              opacity: ".5"
            }}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <LocalFlorist />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.PROJ_MANAGER" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.PROJ_MANAGER" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              opacity: ".5"
            }}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <Stars />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.TEAM_LEAD" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.TL" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} sx={{
            alignItems: "center"
          }}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <LocalCafe />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.SR_DEVELOPER" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.SR_DEVELOPER" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} sx={{
            alignItems: "center"
          }}>
            <Stack
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.lighter",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack sx={{
                color: "primary.main"
              }}>
                <Work />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROMOTION.JOINED" })}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.JR_DEVELOPER" })}
                </Typography>
                <Stack direction={"row"} className="text-muted">
                  {" "}
                  <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                  <Typography variant="body2">2 June 2024</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
