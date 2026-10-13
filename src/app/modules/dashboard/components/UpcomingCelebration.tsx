import { Stack, Typography, Avatar, Box, Card } from "@mui/material";
import { CakeOutlined, WorkspacePremiumOutlined } from "@mui/icons-material";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { dateFormatter, getOrdinalSuffix } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { UpcomingCelebration } from "../model";
import { useUpcomingCelebrationsQuery } from "../dashboardQueries";

export const UpComingCelebration = () => {
  const { formatMessage: i } = useIntl();
  const { data: response, isPending: isLoading } = useUpcomingCelebrationsQuery();
  const data: UpcomingCelebration = response?.success
    ? response.methodResult
    : { birthday: [], workAnniversary: [] };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Card sx={{ p: { xs: 2, sm: 2.5 }, minHeight: 0 }}>
      {data.birthday.length === 0 && data.workAnniversary.length === 0 ? (
        <Box component="div" sx={{ minHeight: 160, display: "grid", placeItems: "center" }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500 }}>
            {i({ id: "TITLES.NO_UPCOMING_CELEBRATION" })}
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={2.25}
          tabIndex={0}
          aria-label="Upcoming birthdays and work anniversaries"
          sx={{
            maxHeight: { xs: 380, lg: 460 },
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
          {data.birthday.length > 0 && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pb: 1.1, mb: 1.25, borderBottom: "1px solid #E2E8F0" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
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
                    }}
                  >
                    <CakeOutlined sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.925rem",
                      letterSpacing: "-0.015em",
                      color: "#0F172A",
                    }}
                  >
                    {i({ id: "TITLES.UPCOMING_BIRTHDAY" })}
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
                  }}
                >
                  {data.birthday.length}
                </Box>
              </Stack>

              <Stack spacing={1}>
                {data.birthday.map((emp) => {
                  return (
                    <Stack
                      key={emp.employeeId}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.15,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.65)",
                        border: "1px solid rgba(255, 255, 255, 0.85)",
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.92)",
                          borderColor: "rgba(11, 92, 171, 0.28)",
                          boxShadow: "0 6px 16px rgba(11, 92, 171, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          alt={emp.employeeName}
                          src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: "0.9rem",
                            border: "1px solid #E2E8F0",
                          }}
                        />
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0F172A" }} noWrap>
                            {emp.employeeName}
                          </Typography>
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
                              fontSize: "0.7rem",
                            }}
                          >
                            {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.BIRTHDAY" })}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography sx={{ flexShrink: 0, whiteSpace: "nowrap", fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        {dayjs().isSame(dayjs(emp.date), "day")
                          ? i({ id: "DATETIME.TODAY" })
                          : dateFormatter(emp.date, "DD MMM YYYY")}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
          {data.workAnniversary.length > 0 && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pb: 1.1, mb: 1.25, borderBottom: "1px solid #E2E8F0" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      display: "grid",
                      placeItems: "center",
                      color: "#059669",
                    }}
                  >
                    <WorkspacePremiumOutlined sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.925rem",
                      letterSpacing: "-0.015em",
                      color: "#0F172A",
                    }}
                  >
                    {i({ id: "TITLES.UPCOMING_WORK_ANNIVERSARY" })}
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
                  }}
                >
                  {data.workAnniversary.length}
                </Box>
              </Stack>

              <Stack spacing={1}>
                {data.workAnniversary.map((emp) => {
                  return (
                    <Stack
                      key={emp.employeeId}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.15,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.65)",
                        border: "1px solid rgba(255, 255, 255, 0.85)",
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.92)",
                          borderColor: "rgba(11, 92, 171, 0.28)",
                          boxShadow: "0 6px 16px rgba(11, 92, 171, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          alt={emp.employeeName}
                          src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: "0.9rem",
                            border: "1px solid #E2E8F0",
                          }}
                        />
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0F172A" }} noWrap>
                            {emp.employeeName}
                          </Typography>
                          <Typography
                            sx={{
                              width: "fit-content",
                              px: 0.85,
                              py: 0.15,
                              borderRadius: "5px",
                              backgroundColor: "#ECFDF5",
                              border: "1px solid #A7F3D0",
                              color: "#047857",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.WORK_ANNIVERSARY" })}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography sx={{ flexShrink: 0, whiteSpace: "nowrap", fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        {dayjs().isSame(dayjs(emp.date), "day")
                          ? i({ id: "DATETIME.TODAY" })
                          : dateFormatter(emp.date, "DD MMM YYYY")}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Card>
  );
};
