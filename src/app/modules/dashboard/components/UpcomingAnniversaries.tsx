import { Stack, Typography, Avatar, Box, Card, Tooltip, alpha } from "@mui/material";
import { WorkspacePremiumOutlined } from "@mui/icons-material";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { dateFormatter, getOrdinalSuffix } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { CelebrationModule } from "../model";
import { useUpcomingCelebrationsQuery } from "../dashboardQueries";
import { useIsDark } from "../../theme/useIsDark";

export interface UpcomingAnniversariesProps {
  anniversaries?: CelebrationModule[];
  isLoading?: boolean;
}

export const UpcomingAnniversaries = ({
  anniversaries,
  isLoading: propIsLoading,
}: UpcomingAnniversariesProps) => {
  const isDark = useIsDark();
  const { formatMessage: i } = useIntl();
  const query = useUpcomingCelebrationsQuery();

  const isLoading =
    propIsLoading !== undefined
      ? propIsLoading
      : anniversaries === undefined
        ? query.isPending
        : false;

  const list: CelebrationModule[] =
    anniversaries !== undefined
      ? anniversaries
      : query.data?.success
        ? query.data.methodResult.workAnniversary
        : [];

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 1.1, mb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              backgroundColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.12),
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.25),
              display: "grid",
              placeItems: "center",
              color: "success.main",
              flexShrink: 0,
            }}
          >
            <WorkspacePremiumOutlined sx={{ fontSize: 16 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.875rem", sm: "0.925rem" },
              letterSpacing: "-0.015em",
              color: "text.primary",
            }}
            noWrap
          >
            {i({
              id: "TITLES.UPCOMING_WORK_ANNIVERSARY",
              defaultMessage: "Upcoming Work Anniversaries",
            })}
          </Typography>
        </Stack>
        <Box
          sx={{
            px: 0.9,
            py: 0.25,
            borderRadius: "6px",
            backgroundColor: isDark ? "action.hover" : "#F1F5F9",
            border: "1px solid",
            borderColor: "divider",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "text.secondary",
            flexShrink: 0,
          }}
        >
          {list.length}
        </Box>
      </Stack>

      {list.length === 0 ? (
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 140,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 2.5,
            px: 1,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              backgroundColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.12),
              border: "1px dashed",
              borderColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.35),
              display: "grid",
              placeItems: "center",
              color: "success.main",
              mb: 1,
            }}
          >
            <WorkspacePremiumOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontWeight: 500 }}>
            {i({
              id: "TITLES.NO_UPCOMING_WORK_ANNIVERSARY",
              defaultMessage: "No upcoming work anniversaries right now",
            })}
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={1}
          tabIndex={0}
          aria-label="Upcoming work anniversaries list"
          sx={{
            flexGrow: 1,
            maxHeight: { xs: 260, sm: 280, md: 300 },
            overflowY: "auto",
            pr: 0.5,
            pt: 0.75,
            pb: 0.75,
            px: 0.5,
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#94A3B8",
            },
          }}
        >
          {list.map((emp) => {
            const isToday = dayjs().isSame(dayjs(emp.date), "day");
            return (
              <Stack
                key={emp.employeeId}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1.25}
                sx={{
                  p: { xs: 1, sm: 1.15 },
                  borderRadius: "12px",
                  backgroundColor: (theme) =>
                    isToday
                      ? alpha(theme.palette.success.main || "#059669", 0.15)
                      : isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(255, 255, 255, 0.65)",
                  border: "1px solid",
                  borderColor: (theme) =>
                    isToday
                      ? alpha(theme.palette.success.main || "#059669", 0.35)
                      : "divider",
                  boxShadow: isDark
                    ? "none"
                    : "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      isToday
                        ? alpha(theme.palette.success.main || "#059669", 0.22)
                        : isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.95)",
                    borderColor: "success.main",
                    boxShadow: (theme) =>
                      `0 4px 14px ${alpha(theme.palette.success.main || "#059669", 0.15)}`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{ minWidth: 0, flex: 1 }}
                >
                  <Avatar
                    alt={emp.employeeName}
                    src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      fontSize: "0.85rem",
                      border: "1px solid",
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  />
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Tooltip title={emp.employeeName} placement="top" arrow>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.825rem", sm: "0.875rem" },
                          color: "text.primary",
                        }}
                        noWrap
                      >
                        {emp.employeeName}
                      </Typography>
                    </Tooltip>
                    <Typography
                      sx={{
                        width: "fit-content",
                        px: 0.85,
                        py: 0.15,
                        borderRadius: "5px",
                        backgroundColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.12),
                        border: "1px solid",
                        borderColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.25),
                        color: "success.main",
                        fontWeight: 600,
                        fontSize: { xs: "0.68rem", sm: "0.7rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getOrdinalSuffix(emp.ordinal) +
                        " " +
                        i({
                          id: "TITLES.WORK_ANNIVERSARY",
                          defaultMessage: "Work Anniversary",
                        })}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography
                  sx={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.72rem", sm: "0.78rem" },
                    fontWeight: 600,
                    color: isToday ? "success.main" : "text.secondary",
                    ...(isToday && {
                      px: 0.8,
                      py: 0.2,
                      borderRadius: "5px",
                      backgroundColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.12),
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.success.main || "#059669", 0.25),
                    }),
                  }}
                >
                  {isToday
                    ? i({ id: "DATETIME.TODAY", defaultMessage: "Today" })
                    : dateFormatter(emp.date, "DD MMM YYYY")}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};

