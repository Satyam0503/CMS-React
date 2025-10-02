import { useEffect, useState } from "react";
import { CardSkeleton } from "./CardSkeleton";
import { CustomCard } from "../../../shared/components/CustomCard";
import { useIntl } from "react-intl";
import { GetHolidayPayloadModel, HolidayModel } from "../../holidays/models";
import dayjs from "dayjs";
import { getAllHolidays } from "../../holidays/holidayServices";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import { dateFormatter, holidayTypeDecoder } from "../../../../utils/common";
import { isSameDate } from "./UpcomingBirthday";
import { Link } from "react-router-dom";
import React from "react";
import { UpComingHolidayModel } from "../model";
import { getUpcomingHolidays } from "../dashboardservices";
import { CalendarToday } from "@mui/icons-material";

export const UpComingHolidays = () => {
    const { formatMessage: i } = useIntl();
    const [holidays, setHolidays] = useState<UpComingHolidayModel[]>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchedHolidayData = async () => {
            try {
                const { data } = await getUpcomingHolidays();
                if (data.success) {
                    setHolidays(data.methodResults);
                }
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchedHolidayData()
    }, []);

    if (isLoading) {
        return <CardSkeleton />
    }
    return (
        <CustomCard label={i({ id: "TITLES.UPCOMING_HOLIDAYS" })}>
            <Stack className="flex-grow-1 justify-content-between mt-4" >
                {!holidays.length ? (
                    <Box component="div" className="flex-grow-1 align-content-center text-center"
                    >
                        <Typography variant="h5">{i({ id: "HOLIDAY.NO_HOLIDAYS" })}</Typography>
                    </Box>
                ) : (
                    <Stack className="gap-2">
                        {holidays.slice(0, 5).map((item) => {
                            return (
                                <React.Fragment key={item.holidayId} >
                                    <Stack className="flex-row gap-3">
                                        {
                                            item.holidayCoverImageUrl ?
                                                <Avatar sx={{
                                                    width: 48,
                                                    height: 48,
                                                    boxShadow: 2,
                                                    bgcolor: "secondary.main"
                                                }} src={item.holidayCoverImageUrl} variant="rounded" />

                                                : <Avatar variant="rounded" sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: "secondary.main"
                                                }}>
                                                    <CalendarToday />
                                                </Avatar>
                                        }
                                        <Stack className="">
                                            <Typography variant="body1" sx={{
                                                color: "text.primary"
                                            }}>{item.holidayName}</Typography>
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
                )}
                {
                    holidays.length > 0 &&
                    <Link to="/holidays" color="primary.main">
                        <Typography
                            sx={{ fontSize: "12px", textDecoration: "underline" }}
                        >
                            {i({ id: "BUTTON.SEE_MORE" })}
                        </Typography>
                    </Link>
                }
            </Stack>
        </CustomCard >
    )
}