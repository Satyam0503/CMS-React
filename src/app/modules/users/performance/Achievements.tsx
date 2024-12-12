import { Typography, Card, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { FeedbackOutlined } from "@mui/icons-material";
import HalfRating from "../../components/HalfRating";
import { CalendarIcon } from "@mui/x-date-pickers";

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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
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
            className="mb-2 align-items-center"
          >
            <Stack>
              <FeedbackOutlined />
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
