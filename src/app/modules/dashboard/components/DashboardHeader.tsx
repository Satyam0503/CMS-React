import { CalendarMonth, WavingHand } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { memo } from "react";
import dayjs from "dayjs";
import { dateFormatter } from "../../../../utils/common";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export const DashboardHeader = memo((props: { fullName: string }) => {
  const intl = useIntl();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      className="dashboard-hero"
      sx={{ justifyContent: "space-between", gap: 2 }}
    >
      <Stack spacing={1} sx={{ position: "relative", zIndex: 1 }}>
        <Chip
          icon={<WavingHand />}
          label="Workspace overview"
          size="small"
          className="dashboard-hero-chip"
        />
        <Typography component="h1" variant="h2" className="dashboard-welcome-title">
          <span className="dashboard-welcome-word">
            {intl.formatMessage({ id: "MESSAGE.WELCOME" })}
          </span>{" "}
          <span className="dashboard-welcome-name">{props.fullName || ""}</span>
        </Typography>
        <Typography color="text.secondary" className="dashboard-welcome-copy">
          Here is what is happening across your workplace today.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} className="dashboard-date-card">
        <Box className="dashboard-weather-icon">
          <img
            src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
            alt="Current weather"
          />
        </Box>
        <Stack sx={{ alignItems: "flex-start" }}>
          <Typography variant="h4" fontWeight={800}>
            {dateFormatter(dayjs(), "dddd")}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CalendarMonth sx={{ fontSize: 15, color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">
              {dateFormatter(dayjs(), "ll")}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});
