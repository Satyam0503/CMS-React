import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { greetingKey } from "../dashboardMetrics";
import { DashboardOverview } from "../model";

type Props = {
  fullName: string;
  subtitleId?: string;
  overview?: DashboardOverview | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export const DashboardHeader = ({
  fullName,
  subtitleId = "DASHBOARD.SUBTITLE",
  overview,
  onRefresh,
  isRefreshing,
}: Props) => {
  const { formatMessage: i, locale } = useIntl();
  const now = dayjs();
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";
  const dateCandidate = overview?.asOfDate;
  const hasValidAsOfDate =
    typeof dateCandidate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateCandidate) &&
    !Number.isNaN(new Date(`${dateCandidate}T00:00:00Z`).getTime()) &&
    new Date(`${dateCandidate}T00:00:00Z`).toISOString().slice(0, 10) === dateCandidate;
  const asOfDate = hasValidAsOfDate ? dateCandidate! : null;
  const asOfDateValue = asOfDate ? new Date(`${asOfDate}T00:00:00Z`) : null;
  const asOfDateLabel = asOfDateValue
    ? new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(asOfDateValue)
    : null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", md: "1.875rem" },
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {i({ id: greetingKey(now.hour()) }, { name: firstName })}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "1rem" }}>
          {i({ id: subtitleId })}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={1}>
        {asOfDate && asOfDateLabel && (
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
            <Typography
              component="time"
              dateTime={asOfDate}
              aria-label={i(
                { id: "DASHBOARD.AS_OF_DATE", defaultMessage: "Dashboard data for {date}" },
                { date: asOfDateLabel },
              )}
              sx={{ fontWeight: 600, fontSize: "0.9375rem" }}
            >
              {asOfDateLabel}
            </Typography>
          </Stack>
        )}
        {onRefresh && (
          <Tooltip title={i({ id: "COMMON.REFRESH", defaultMessage: "Refresh Data" })}>
            <span>
              <IconButton
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label={i({ id: "COMMON.REFRESH", defaultMessage: "Refresh Data" })}
                size="small"
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: "12px",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <RefreshOutlined
                  sx={{
                    fontSize: 18,
                    animation: isRefreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};
