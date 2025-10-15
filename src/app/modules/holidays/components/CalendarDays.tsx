import {
    Avatar,
    Box,
    Card,
    Grid,
    Paper,
    Popover,
    Tooltip,
    Typography,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { HolidayModel, HolidayResponseModel } from "../models";
import dayjs from "dayjs";
import UpcomingHolidayCard from "./UpcomingHolidayCard";
import { CalendarToday } from "@mui/icons-material";
import { useThemeContext } from "../../../Context/ThemeContext";

type Props = {
    selectedDate: string | undefined;
    selectedMonth: string | undefined;
    selectedYear: string | undefined;
    handleSelectDate: (date: string) => void;
    holidays: Array<HolidayModel>;
    handleRefresh: () => void;
};

export default function CalendarDays(props: Props) {
    const { formatMessage: i } = useIntl();
    const [thisMonthsHolidays, setthisMonthsHolidays] = useState<
        Array<HolidayResponseModel>
    >([]);
    // const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [isTodayMonthYear, setIsTodayMonthYear] = useState<boolean>(true);

    const screenWidth: number = screen.width;

    const weekDays: Array<string> = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];

    const weekDaysSmlScreen: Array<string> = [
        "S", 
        "M", 
        "T", 
        "W", 
        "T", 
        "F", 
        "S"
    ];

    const date = new Date();
    const todayDate = String(date.getDate()).padStart(2, "0");
    const todayMonth = String(date.getMonth());
    const todayYear = String(date.getFullYear());
    const { theme } = useThemeContext();

    let days: Array<string> = [];

    getDaysInCurrentMonth(props.selectedMonth, props.selectedYear);

    function getDaysInCurrentMonth(
        month: string | undefined,
        year: string | undefined
    ) {
        days.length = 0;
        const day = new Date();

        function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
        }

        function getFirstDayOfMonth(year: string, month: string) {
        const date = new Date(parseInt(year), parseInt(month), 1);
        const day = date.getDay();

        return day === 0 ? 7 : day;
        }

        if (month && year) {
        const firstDateOfMonth = getFirstDayOfMonth(year, month);
        const daysInCurrentMonth = getDaysInMonth(
            parseInt(month),
            parseInt(month)
        );

        for (let i: number = 0; i < firstDateOfMonth; i++) {
            if (firstDateOfMonth === 7) {
            break;
            }
            days.push(" ");
        }

        for (let i: number = 1; i <= daysInCurrentMonth; i++) {
            days.push(String(i).padStart(2, "0"));
        }
        }
    }

    function checkIsCurrentMonthYear() {
        const { selectedDate, selectedMonth, selectedYear } = props;

        if (selectedDate && selectedMonth && selectedYear) {
        const isSameMonthYear =
            Number(selectedMonth) === Number(todayMonth) &&
            Number(selectedYear) === Number(todayYear);

        setIsTodayMonthYear(isSameMonthYear);
        }
    }

    function findHolidayForMonth() {
        let thisMonthHolidaysFinder: Array<HolidayModel> = [];

        props.holidays.forEach((hol) => {
        if (hol.date) {
            const month = dayjs(hol.date).format("MM");
            const year = dayjs(hol.date).format("YYYY");

            const selecMonth = String(
            parseInt(
                dayjs(`${props.selectedYear}-${props.selectedMonth}-01`).format(
                "MM"
                )
            ) + 1
            );
            const selecYear = dayjs(
            `${props.selectedYear}-${props.selectedMonth}-01`
            ).format("YYYY");

            if (props.selectedMonth && props.selectedYear) {
            if (month == selecMonth && year == selecYear) {
                thisMonthHolidaysFinder.push(hol);
            }
            }
        }
        setthisMonthsHolidays(thisMonthHolidaysFinder);
        });
    }

    function checkHolidaysDateThisMonth() {
        const holidayDatesArray: Array<[name: string, date: string]> = [];
        thisMonthsHolidays.forEach((hol) => {
        if (hol.date) {
            const date = String(hol.date);
            const name = hol.holidayName;
            holidayDatesArray.push([name, date]);
        }
        });

        // setHolidayDates(holidayDatesArray)
    }

    function handlePopoverOpen(event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(event.currentTarget);
    }

    function handlePopoverClose() {
        setAnchorEl(null);
    }

    const popoverOpen = Boolean(anchorEl);

    useEffect(() => {
        checkIsCurrentMonthYear();
        getDaysInCurrentMonth(props.selectedMonth, props.selectedYear);
        findHolidayForMonth();
    }, [
        props.selectedDate,
        props.selectedMonth,
        props.selectedYear,
        props.holidays,
    ]);

    useEffect(() => {
        checkHolidaysDateThisMonth();
    }, [thisMonthsHolidays]);

    useEffect(() => {
        findHolidayForMonth();
    }, [props.selectedMonth, props.selectedYear]);

    return (
        <Box
        component={"div"}
        className="d-flex flex-column gap-4 calendar-days"
        sx={{
            height: "100%",
        }}
        >
        <Card
            className="gap-4 calendar-days-header calendar-days-grid"
            sx={{
            height: "100px",
            padding: "0 20px",
            width: "100%",
            }}
        >
            {screenWidth > 600
            ? weekDays.map((weekDay, index) => {
                return (
                    <Box
                    component={"div"}
                    key={index}
                    className="d-flex justify-content-center align-items-center"
                    sx={{
                        width: "100%",
                        height: "80px",
                    }}
                    >
                    <Typography
                        variant="h5"
                        sx={{
                        fontWeight: "600",
                        }}
                    >
                        {weekDay}
                    </Typography>
                    </Box>
                );
                })
            : weekDaysSmlScreen.map((weekDay, index) => {
                return (
                    <Box
                    component={"div"}
                    key={index}
                    className="d-flex justify-content-center align-items-center"
                    sx={{
                        width: "100%",
                        height: "80px",
                    }}
                    >
                    <Typography
                        variant="h5"
                        sx={{
                        fontWeight: "600",
                        }}
                    >
                        {weekDay}
                    </Typography>
                    </Box>
                );
                })}
        </Card>
        <Card
            className="calendar-days-grid"
            sx={{
            height: "100%",
            }}
        >
            {days.map((day, index) => {
            return (
                <Box key={index}
                component={"div"}
                onClick={(e) => {
                    props.handleSelectDate(String(day));
                }}
                className={`hover-theme-color calendar-day position-relative ${
                    isTodayMonthYear && day == todayDate && "today"
                } ${props.selectedDate == day && "selected-day"}`}
                >
                <Typography variant="h6">{day}</Typography>
                {thisMonthsHolidays.length > 0 &&
                    thisMonthsHolidays.map((holiday, index) => {
                    const holidayDate = dayjs(holiday.date).format("DD");

                    if (holidayDate == day) {
                        return (
                        <Tooltip key={index}
                            slotProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor:theme ==="dark" ? "background.card":"background.body",
                                    color: theme === "light" ? 'black':"white",
                                },
                            },
                            arrow:{
                                sx:{
                                    color:theme ==="dark" ? "background.card":"background.body"
                                }
                            }
                            }}
                            title={<ToolTipPopOver holiday={holiday} />}
                        >
                            {screenWidth > 850 ? 
                                <Box
                                    key={index}
                                    className={`calendar-day-holiday ${holiday.holidayType == 1 ? 'holiday' : 'event'}`}
                                    sx={{
                                        padding: "0px 5px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",   
                                    }}
                                    aria-owns={popoverOpen ? String(index) : undefined}
                                    aria-haspopup="true"
                                    onMouseEnter={handlePopoverOpen}
                                    onMouseLeave={handlePopoverClose}
                                    >
                                    <Typography
                                        sx={{
                                            padding: '0 4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {holiday.holidayName.length > 10
                                        ? holiday.holidayName
                                            .split("")
                                            .splice(0, 10)
                                            .join("") + "..."
                                        : holiday.holidayName}
                                    </Typography>
                                </Box>
                                : <Box
                                    key={index}
                                    className={`calendar-day-holiday-dot ${holiday.holidayType == 1 ? 'holiday-dot' : 'event-dot'}`}
                                        sx={{
                                            
                                        }}
                                    aria-owns={popoverOpen ? String(index) : undefined}
                                    aria-haspopup="true"
                                    onMouseEnter={handlePopoverOpen}
                                    onMouseLeave={handlePopoverClose}
                                    >
                                </Box>
                                }
                            
                        </Tooltip>
                        );
                    }
                    })}
                </Box>
            );
            })}
        </Card>
        </Box>
    );
}

type PropType = {
    holiday: HolidayResponseModel;
};

const ToolTipPopOver = ({ holiday }: PropType) => {
    return (
        <Box component={"div"} className="d-flex gap-4 align-items-center">
        {holiday.holidayImageUrl ? (
            <Avatar
            sx={{
                width: 40,
                height: 40,
                boxShadow: 2,
                bgcolor: "secondary.main",
            }}
            src={String(holiday.holidayCoverImageUrl)}
            variant="rounded"
            />
        ) : (
            <Avatar
            variant="rounded"
            sx={{
                width: 40,
                height: 40,
                bgcolor: "secondary.main",
            }}
            >
            <CalendarToday className="fs-32" />
            </Avatar>
        )}
        <Box component={"div"} className="d-flex flex-column ">
            <Typography variant="body1">{holiday.holidayName}</Typography>
            <Typography variant="body2">
            {holiday.detail.length > 30
                ? holiday.detail.slice(0, 23).concat("...")
                : holiday.detail}
            </Typography>
        </Box>
        </Box>
    );
};
