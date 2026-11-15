import { CalendarTodayOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { greetingKey } from "../dashboardMetrics";

type Props = { fullName: string; subtitleId?: string };

export const DashboardHeader = ({ fullName, subtitleId = "DASHBOARD.SUBTITLE" }: Props) => {
  const { formatMessage: i } = useIntl();
  const now = dayjs();
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
    >
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {i({ id: greetingKey(now.hour()) }, { name: firstName })}{" "}
          <span role="img" aria-hidden>
            👋
          </span>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "1rem" }}>
          {i({ id: subtitleId })}
        </Typography>
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: 1,
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          whiteSpace: "nowrap",
        }}
      >
        <CalendarTodayOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography component="time" dateTime={now.format("YYYY-MM-DD")} sx={{ fontWeight: 600, fontSize: "0.9375rem" }}>
          {now.format("ddd, D MMM YYYY")}
        </Typography>
      </Stack>
    </Stack>
  );
};
