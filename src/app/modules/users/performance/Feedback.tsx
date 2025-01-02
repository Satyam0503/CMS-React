import { Typography, Card, Grid, Stack, IconButton } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Announcement,
  FeedbackOutlined,
  FeedbackTwoTone,
} from "@mui/icons-material";
import HalfRating from "../../components/HalfRating";
import { CalendarIcon } from "@mui/x-date-pickers";
import { colors } from "../../theme/MuiTheme";

type Props = {
  className: string;
};

export default function Feedback() {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ p: "15px", width: "100%" }}>
          <Typography variant="h5" sx={{ mb: "5px" }}>
            {intl.formatMessage({ id: "PERFORMANCE.FEEDBACK" })}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            className="mb-2 align-items-center"
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: 1,
              }}
            >
              <Announcement sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Exemplary Contribution
              </Typography>
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Typography variant="body2">
                  By Kanika Pandey (Hr Manager)
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
                <HalfRating />
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            className="mb-2 align-items-center"
          >
            <Stack
              sx={{
                background: colors.alpha.primary[100],
                borderRadius: "4px",
                p: 1,
              }}
            >
              <Announcement sx={{ color: colors.alpha.primary[500] }} />
            </Stack>
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Outstanding Performance
              </Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  By Nitish Kumar (Team Lead)
                </Typography>
                <Typography variant="body2" className="text-muted">
                  <CalendarIcon />2 June 2024
                </Typography>
                <HalfRating />
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
