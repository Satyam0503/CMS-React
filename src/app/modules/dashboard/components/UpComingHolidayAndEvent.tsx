import { CardSkeleton } from "./CardSkeleton";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Box, Card, Divider, Stack, Typography } from "@mui/material";
import { dateFormatter } from "../../../../utils/common";
import React from "react";
import { CalendarToday, Celebration } from "@mui/icons-material";
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
        return <CardSkeleton />
    }
    return (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, minHeight: 0 }}>
            {holidayandEvent.event.length == 0 && holidayandEvent.holiday.length == 0 ?
                <Box component="div" sx={{ minHeight: 160, display: "grid", placeItems: "center" }}>
                    <Typography className="fs-16">{i({ id: "TITLES.NO_EVENT_HOLIDAY" })}</Typography>
                </Box>
                :
                <Stack
                    spacing={2}
                    tabIndex={0}
                    aria-label="Upcoming holidays and events"
                    sx={{
                        maxHeight: { xs: 360, lg: 420 },
                        overflowY: "auto",
                        pr: 0.75,
                        mr: -0.75,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { width: 0 },
                        "&:hover, &:focus, &:focus-within": {
                            scrollbarWidth: "thin",
                            "&::-webkit-scrollbar": { width: 6 },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "color-mix(in srgb, var(--mui-palette-primary-main) 42%, transparent)",
                                borderRadius: 99,
                            },
                        },
                    }}
                >
                    {
                        holidayandEvent.holiday.length > 0 &&
                        <Box component="div">
                            <Typography className="fw-bold fs-16 mb-3">{i({ id: "TITLES.UPCOMING_HOLIDAYS" })}</Typography>
                            <Stack className="gap-2 ms-2">
                                {holidayandEvent.holiday.map((item) => {
                                    return (
                                        <React.Fragment key={item.id} >
                                            <Stack className="flex-row gap-3">
                                                {
                                                    item.imageUrl ?
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48,
                                                            boxShadow: 2,
                                                            bgcolor: "secondary.main"
                                                        }} src={item.imageUrl} variant="rounded" />

                                                        : <Avatar variant="rounded" sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: "secondary.main",
                                                        }}>
                                                            <CalendarToday className="fs-32" />
                                                        </Avatar>
                                                }
                                                <Stack className="">
                                                    <Typography className="fw-bold">{item.name}</Typography>
                                                    <Typography variant="subtitle2">
                                                        {dayjs().isSame(dayjs(item.date), "day")
                                                            ? i({ id: "DATETIME.TODAY" })
                                                            : dateFormatter(item.date, "DD MMM YYYY")}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <Divider />
                                        </React.Fragment>
                                    );
                                })}
                            </Stack>
                        </Box>

                    }
                    {
                        holidayandEvent.event.length > 0 &&
                        <Box component="div">
                            <Typography className="fw-bold fs-16 mb-3">{i({ id: "TITLES.UPCOMING_EVENTS" })}</Typography>
                            <Stack className="gap-2 ms-2">
                                {holidayandEvent.event.map((item) => {
                                    return (
                                        <React.Fragment key={item.id} >
                                            <Stack className="flex-row gap-3">
                                                {
                                                    item.imageUrl ?
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48,
                                                            boxShadow: 2,
                                                            bgcolor: "secondary.main"
                                                        }} src={item.imageUrl} variant="rounded" />

                                                        : <Avatar variant="rounded" sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: "secondary.main"
                                                        }}>
                                                            <Celebration className="fw-32" />
                                                        </Avatar>
                                                }
                                                <Stack className="">
                                                    <Typography className="fw-bold">{item.name}</Typography>
                                                    <Typography variant="subtitle2">
                                                        {dayjs().isSame(dayjs(item.date), "day")
                                                            ? i({ id: "DATETIME.TODAY" })
                                                            : dateFormatter(item.date, "DD MMM YYYY")}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <Divider />
                                        </React.Fragment>
                                    );
                                })}
                            </Stack>
                        </Box>

                    }
                </Stack>
            }
            {
                (holidayandEvent.event.length > 0 || holidayandEvent.holiday.length > 0) &&
                <Link to="/calendar">
                    {i({ id: "BUTTON.SEE_MORE" })}
                </Link>
            }
        </Card >
    )
}
