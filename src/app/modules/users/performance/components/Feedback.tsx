import { Typography, Card, Grid, Stack, IconButton } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Announcement,
  Business,
  CalendarToday,
  DeleteOutline,
  Edit,
} from "@mui/icons-material";
import HalfRating from "../../../components/HalfRating";
import { CalendarIcon } from "@mui/x-date-pickers";
import { colors } from "../../../theme/MuiTheme";
import { CustomIconButton } from "../../../components/CustomIconButton";

type Props = {
  className: string;
};

export default function Feedback() {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ p: 2, width: "100%" }}>
          <Stack
            direction={"row"}
            display={"flex"}
            justifyContent={"space-between"}
          >
            <Typography variant="h5" mb={2}>
              {intl.formatMessage({ id: "PERFORMANCE.FEEDBACK" })}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} mb={2} alignItems={"center"}>
            <Stack
              sx={{
                minWidth: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Announcement />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">Exemplary Contribution</Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  By Kanika Pandey (Hr Manager)
                </Typography>
                <Stack
                  direction={"row"}
                  className="text-muted"
                  spacing={0.5}
                  alignItems={"center"}
                >
                  <CalendarToday sx={{ fontSize: "14px" }} />
                  <Typography variant="body2">2 June 2024</Typography>
                  <HalfRating />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} mb={2} alignItems={"center"}>
            <Stack
              sx={{
                minWidth: 48,
                height: 48,
                bgcolor: colors.alpha.primary[100],
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Stack color={colors.alpha.primary[500]}>
                <Announcement />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">Outstanding Performance</Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
              >
                <Typography variant="body2">
                  By Nitesh Kumar (Team Lead)
                </Typography>
                <Stack
                  direction={"row"}
                  className="text-muted"
                  spacing={0.5}
                  alignItems={"center"}
                >
                  <CalendarToday sx={{ fontSize: "14px" }} />
                  <Typography variant="body2">2 June 2024</Typography>
                  <HalfRating />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
