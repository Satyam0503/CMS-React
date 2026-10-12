import { CardSkeleton } from "./CardSkeleton";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Box, Card, Stack, Typography } from "@mui/material";
import { dateFormatter } from "../../../../utils/common";
import React from "react";
import {
  ArrowForwardRounded,
  CalendarMonthOutlined,
  EventAvailableOutlined,
  EventNoteOutlined,
  GroupsOutlined,
} from "@mui/icons-material";
import { UpComingHolidayAndEventModel } from "../model";
import { Link } from "react-router-dom";
import { useUpcomingEventsQuery } from "../dashboardQueries";

export const UpComingHolidayAndEvents = () => {
  const { formatMessage: i } = useIntl();
  const { data, isPending: isLoading } = useUpcomingEventsQuery();
  const holidayandEvent: UpComingHolidayAndEventModel = data?.success
    ? data.methodResult
    : { holiday: [], event: [] };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Card sx={{ p: { xs: 2, sm: 2.5 }, minHeight: 0 }}>
      {holidayandEvent.event.length === 0 && holidayandEvent.holiday.length === 0 ? (
        <Box component="div" sx={{ minHeight: 160, display: "grid", placeItems: "center" }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500 }}>
            {i({ id: "TITLES.NO_EVENT_HOLIDAY" })}
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={2.25}
          tabIndex={0}
          aria-label="Upcoming holidays and events"
          sx={{
            maxHeight: { xs: 380, lg: 440 },
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
          {holidayandEvent.holiday.length > 0 && (
            <Box component="div">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  pb: 1.1,
                  mb: 1.25,
                  borderBottom: "1px solid #E2E8F0",
                }}
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
                    <EventNoteOutlined sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.925rem",
                      letterSpacing: "-0.015em",
                      color: "#0F172A",
                    }}
                  >
                    {i({ id: "TITLES.UPCOMING_HOLIDAYS" })}
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
                  {holidayandEvent.holiday.length}
                </Box>
              </Stack>

              <Stack spacing={1}>
                {holidayandEvent.holiday.map((item) => {
                  const d = dayjs(item.date);
                  const isToday = dayjs().isSame(d, "day");
                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
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
                          borderColor: "rgba(11, 92, 171, 0.3)",
                          boxShadow: "0 6px 16px rgba(11, 92, 171, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {item.imageUrl ? (
                        <Avatar
                          sx={{ width: 42, height: 42, borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.85)" }}
                          src={item.imageUrl}
                          variant="rounded"
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "10px",
                            backgroundColor: "rgba(11, 92, 171, 0.08)",
                            border: "1px solid rgba(11, 92, 171, 0.18)",
                            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.8)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#0B5CAB",
                              lineHeight: 1.1,
                            }}
                          >
                            {d.format("MMM")}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: "#0F172A",
                              lineHeight: 1.15,
                            }}
                          >
                            {d.format("DD")}
                          </Typography>
                        </Box>
                      )}
                      <Stack sx={{ minWidth: 0, flexGrow: 1 }} spacing={0.15}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#0F172A",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: isToday ? "#0B5CAB" : "#64748B",
                          }}
                        >
                          {isToday
                            ? i({ id: "DATETIME.TODAY" })
                            : `${d.format("dddd")}, ${dateFormatter(item.date, "DD MMM YYYY")}`}
                        </Typography>
                      </Stack>
                      <CalendarMonthOutlined sx={{ fontSize: 17, color: "#94A3B8", flexShrink: 0 }} />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}

          {holidayandEvent.event.length > 0 && (
            <Box component="div">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  pb: 1.1,
                  mb: 1.25,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      backgroundColor: "#F0F9FF",
                      border: "1px solid #BAE6FD",
                      display: "grid",
                      placeItems: "center",
                      color: "#0284C7",
                    }}
                  >
                    <GroupsOutlined sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.925rem",
                      letterSpacing: "-0.015em",
                      color: "#0F172A",
                    }}
                  >
                    {i({ id: "TITLES.UPCOMING_EVENTS" })}
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
                  {holidayandEvent.event.length}
                </Box>
              </Stack>

              <Stack spacing={1}>
                {holidayandEvent.event.map((item) => {
                  const d = dayjs(item.date);
                  const isToday = dayjs().isSame(d, "day");
                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
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
                          borderColor: "rgba(2, 132, 199, 0.35)",
                          boxShadow: "0 6px 16px rgba(2, 132, 199, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {item.imageUrl ? (
                        <Avatar
                          sx={{ width: 42, height: 42, borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.85)" }}
                          src={item.imageUrl}
                          variant="rounded"
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "10px",
                            backgroundColor: "rgba(2, 132, 199, 0.08)",
                            border: "1px solid rgba(2, 132, 199, 0.20)",
                            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.8)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#0284C7",
                              lineHeight: 1.1,
                            }}
                          >
                            {d.format("MMM")}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: "#0F172A",
                              lineHeight: 1.15,
                            }}
                          >
                            {d.format("DD")}
                          </Typography>
                        </Box>
                      )}
                      <Stack sx={{ minWidth: 0, flexGrow: 1 }} spacing={0.15}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#0F172A",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: isToday ? "#0284C7" : "#64748B",
                          }}
                        >
                          {isToday
                            ? i({ id: "DATETIME.TODAY" })
                            : `${d.format("dddd")}, ${dateFormatter(item.date, "DD MMM YYYY")}`}
                        </Typography>
                      </Stack>
                      <EventAvailableOutlined sx={{ fontSize: 17, color: "#94A3B8", flexShrink: 0 }} />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}

          {(holidayandEvent.event.length !== 0 || holidayandEvent.holiday.length !== 0) && (
            <Link to="/calendar" style={{ alignSelf: "flex-start" }}>
              <Stack
                direction="row"
                spacing={0.6}
                alignItems="center"
                sx={{
                  px: 1.25,
                  py: 0.55,
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#334155",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    backgroundColor: "#EEF2FF",
                    borderColor: "#C7D2FE",
                    color: "#4F46E5",
                  },
                }}
              >
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "inherit" }}>
                  {i({ id: "BUTTON.SEE_MORE" })}
                </Typography>
                <ArrowForwardRounded sx={{ fontSize: 14 }} />
              </Stack>
            </Link>
          )}
        </Stack>
      )}
    </Card>
  );
};
