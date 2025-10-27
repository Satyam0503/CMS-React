import { useEffect, useState } from "react";
import { CardSkeleton } from "./CardSkeleton";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Box, Card, Divider, Stack, Typography } from "@mui/material";
import { dateFormatter, holidayTypeDecoder } from "../../../../utils/common";
import { isSameDate } from "./UpcomingCelebration";
import React from "react";
import { CalendarToday, Celebration } from "@mui/icons-material";
import { UpComingHolidayAndEventModel } from "../model";
import { getUpcomingHolidayAndEvents } from "../dashboardservices";

export const UpComingHolidayAndEvents = () => {
    const { formatMessage: i } = useIntl();
    const [holidayandEvent, setHolidayAndEvent] = useState<UpComingHolidayAndEventModel>({ holiday: [], event: [] });
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchedHolidayAndEventData = async () => {
            try {
                const { data } = await getUpcomingHolidayAndEvents();
                if (data.success) {
                    setHolidayAndEvent(data.methodResult);
                }
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchedHolidayAndEventData()
    }, []);

    if (isLoading) {
        return <CardSkeleton />
    }
    return (
        <Card className="p-4" sx={{ minHeight: 280 }}>
            {holidayandEvent.event.length == 0 && holidayandEvent.holiday.length == 0 ?
                <Box component="div" className="h-100 align-content-center text-center">
                    <Typography className="fs-16">{i({ id: "TITLES.NO_EVENT_HOLIDAY" })}</Typography>
                </Box>
                :
                <Stack spacing={2}>
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
                                                            bgcolor: "secondary.main"
                                                        }}>
                                                            <CalendarToday />
                                                        </Avatar>
                                                }
                                                <Stack className="">
                                                    <Typography className="fw-bold">{item.name}</Typography>
                                                    <Typography variant="subtitle2">
                                                        {!isSameDate(dayjs(item.date))
                                                            ? dateFormatter(item.date, "DD MMM YYYY")
                                                            : i({ id: "DATETIME.TODAY" })}
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
                                                            <Celebration />
                                                        </Avatar>
                                                }
                                                <Stack className="">
                                                    <Typography className="fw-bold">{item.name}</Typography>
                                                    <Typography variant="subtitle2">
                                                        {!isSameDate(dayjs(item.date))
                                                            ? dateFormatter(item.date, "DD MMM YYYY")
                                                            : i({ id: "DATETIME.TODAY" })}
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
        </Card >
    )
}