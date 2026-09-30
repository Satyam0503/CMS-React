import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  DomainVerificationOutlined,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { memo } from "react";
import dayjs from "dayjs";
import { dateFormatter } from "../../../../utils/common";

export const DashboardHeader = memo((props: { fullName: string }) => {
  const intl = useIntl();
  const now = dayjs();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      className="dashboard-hero"
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2.5,
      }}
    >
      <Stack spacing={0.75} sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{
            width: "fit-content",
            px: 1.25,
            py: 0.4,
            borderRadius: "8px",
            backgroundColor: "rgba(11, 92, 171, 0.08)",
            border: "1px solid rgba(11, 92, 171, 0.18)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "#0B5CAB",
          }}
        >
          <DomainVerificationOutlined sx={{ fontSize: 15, color: "#0D9488" }} />
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#0B5CAB",
              textTransform: "uppercase",
            }}
          >
            Workspace Overview
          </Typography>
        </Stack>
        <Typography component="h1" variant="h2" className="dashboard-welcome-title">
          <span className="dashboard-welcome-word">
            {intl.formatMessage({ id: "MESSAGE.WELCOME" })}
          </span>{" "}
          <span className="dashboard-welcome-name">{props.fullName || ""}</span>
        </Typography>
        <Typography className="dashboard-welcome-copy">
          Real-time attendance, workforce activity, and upcoming company schedules.
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1.75}
        alignItems="center"
        className="dashboard-date-card"
      >
        {/* Minimal Executive Tear-Off Calendar Tile */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.95)",
            boxShadow: "0 4px 14px rgba(11, 92, 171, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#0B5CAB",
              color: "#FFFFFF",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textAlign: "center",
              py: "3px",
              lineHeight: 1.1,
            }}
          >
            {now.format("MMM")}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0F172A",
              fontSize: "1.15rem",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {now.format("DD")}
          </Box>
        </Box>

        <Stack spacing={0.35} sx={{ alignItems: "flex-start", minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#0F172A",
            }}
          >
            {dateFormatter(now, "dddd")}
          </Typography>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarTodayOutlined sx={{ fontSize: 13.5, color: "#0B5CAB" }} />
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#475569",
                  whiteSpace: "nowrap",
                }}
              >
                {dateFormatter(now, "MMM DD, YYYY")}
              </Typography>
            </Stack>
            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "#CBD5E1",
              }}
            />
            <Stack direction="row" spacing={0.4} alignItems="center">
              <AccessTimeOutlined sx={{ fontSize: 13.5, color: "#64748B" }} />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#64748B",
                  whiteSpace: "nowrap",
                }}
              >
                {now.format("YYYY")}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});

