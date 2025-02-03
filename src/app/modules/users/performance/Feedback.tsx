import { Typography, Card, Grid, Stack, IconButton } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Announcement,
  Business,
  DeleteOutline,
  Edit,
} from "@mui/icons-material";
import HalfRating from "../../components/HalfRating";
import { CalendarIcon } from "@mui/x-date-pickers";
import { colors } from "../../theme/MuiTheme";
import { CustomIconButton } from "../../components/CustomIconButton";

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
                width: 48,
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
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Typography variant="body2">
                  By Kanika Pandey (Hr Manager)
                </Typography>
                <Typography variant="body2">
                  <CalendarIcon />2 June 2024
                </Typography>
                <HalfRating />
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2}>
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
                <Announcement />
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="body1">Outstanding Performance</Typography>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="body2">
                  By Nitish Kumar (Team Lead)
                </Typography>
                <Typography variant="body2">
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
