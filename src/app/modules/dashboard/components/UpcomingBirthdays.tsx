import { Stack, Typography, Avatar, Box, Card, Tooltip } from "@mui/material";
import { CakeOutlined } from "@mui/icons-material";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { dateFormatter, getOrdinalSuffix } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { CelebrationModule } from "../model";
import { useUpcomingCelebrationsQuery } from "../dashboardQueries";

export interface UpcomingBirthdaysProps {
  birthdays?: CelebrationModule[];
  isLoading?: boolean;
}

export const UpcomingBirthdays = ({
  birthdays,
  isLoading: propIsLoading,
}: UpcomingBirthdaysProps) => {
  const { formatMessage: i } = useIntl();
  const query = useUpcomingCelebrationsQuery();

  const isLoading =
    propIsLoading !== undefined
      ? propIsLoading
      : birthdays === undefined
        ? query.isPending
        : false;

  const list: CelebrationModule[] =
    birthdays !== undefined
      ? birthdays
      : query.data?.success
        ? query.data.methodResult.birthday
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
        sx={{ pb: 1.1, mb: 1.25, borderBottom: "1px solid #E2E8F0" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              backgroundColor: "#EBF3FA",
              border: "1px solid #C5DDF2",
              display: "grid",
              placeItems: "center",
              color: "#0B5CAB",
              flexShrink: 0,
            }}
          >
            <CakeOutlined sx={{ fontSize: 16 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.875rem", sm: "0.925rem" },
              letterSpacing: "-0.015em",
              color: "#0F172A",
            }}
            noWrap
          >
            {i({ id: "TITLES.UPCOMING_BIRTHDAY", defaultMessage: "Upcoming Birthdays" })}
          </Typography>
        </Stack>
        <Box
          sx={{
            px: 0.9,
            py: 0.25,
            borderRadius: "6px",
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#475569",
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
              backgroundColor: "#EBF3FA",
              border: "1px dashed #C5DDF2",
              display: "grid",
              placeItems: "center",
              color: "#0B5CAB",
              mb: 1,
            }}
          >
            <CakeOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500 }}>
            {i({
              id: "TITLES.NO_UPCOMING_BIRTHDAY",
              defaultMessage: "No upcoming birthdays right now",
            })}
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={1}
          tabIndex={0}
          aria-label="Upcoming birthdays list"
          sx={{
            flexGrow: 1,
            maxHeight: { xs: 260, sm: 280, md: 300 },
            overflowY: "auto",
            pr: 0.5,
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
                  backgroundColor: isToday
                    ? "rgba(235, 243, 250, 0.75)"
                    : "rgba(255, 255, 255, 0.65)",
                  border: isToday
                    ? "1px solid rgba(197, 221, 242, 0.9)"
                    : "1px solid rgba(255, 255, 255, 0.85)",
                  boxShadow:
                    "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderColor: "rgba(11, 92, 171, 0.28)",
                    boxShadow: "0 6px 16px rgba(11, 92, 171, 0.08)",
                    transform: "translateY(-1px)",
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
                      border: "1px solid #E2E8F0",
                      flexShrink: 0,
                    }}
                  />
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Tooltip title={emp.employeeName} placement="top" arrow>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.825rem", sm: "0.875rem" },
                          color: "#0F172A",
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
                        backgroundColor: "#EBF3FA",
                        border: "1px solid #C5DDF2",
                        color: "#0B5CAB",
                        fontWeight: 600,
                        fontSize: { xs: "0.68rem", sm: "0.7rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getOrdinalSuffix(emp.ordinal) +
                        " " +
                        i({ id: "TITLES.BIRTHDAY", defaultMessage: "Birthday" })}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography
                  sx={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.72rem", sm: "0.78rem" },
                    fontWeight: 600,
                    color: isToday ? "#0B5CAB" : "#475569",
                    ...(isToday && {
                      px: 0.8,
                      py: 0.2,
                      borderRadius: "5px",
                      backgroundColor: "#EBF3FA",
                      border: "1px solid #C5DDF2",
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

