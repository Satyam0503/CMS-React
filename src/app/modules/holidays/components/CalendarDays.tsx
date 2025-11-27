import {
    Avatar,
    Box,
    Card,
    Popover,
    Tooltip,
    Typography,
    useColorScheme,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CalendarItem } from "../models";
import dayjs, { Dayjs } from "dayjs";
import { CalendarToday } from "@mui/icons-material";
import clsx from "clsx";

type Props = {
    selectedDate: Dayjs | null;
    handleSelectedDateChange: (updatedDate: dayjs.Dayjs | null) => void;
    occasions: Array<CalendarItem>;
    handleRefresh: () => void;
};

export default function CalendarDays(props: Props) {
    const { selectedDate, handleSelectedDateChange, occasions } = props;
    const [thisMonthsHolidays, setthisMonthsHolidays] = useState<Array<CalendarItem>>([]);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [smlScreenAnchr, setSmlScreenAnchr] = React.useState<HTMLElement | null>(null);
    const [selectedDateOccasions, setSelectedDateOccasions] = useState<Array<CalendarItem>>([])
    const { mode: theme } = useColorScheme();
    const [monthDays, setMonthDays] = useState<Array<number | string>>([]);
    const muiTheme = useTheme();

    const popoverOpen = Boolean(anchorEl);
    const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

    const weekDays: Array<string> = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];
    const open = Boolean(smlScreenAnchr);

    //Gets number of days in any month
    function getDaysInCurrentMonth() {
        const days: Array<number | string> = [];
        const firstDateOfMonth = dayjs(selectedDate).startOf("month").day();
        const daysInCurrentMonth = dayjs(selectedDate).daysInMonth();

        for (let i: number = 0; i < firstDateOfMonth; i++) {
            days.push(" ");
        }

        for (let i: number = 1; i <= daysInCurrentMonth; i++) {
            days.push(i);
        }
        return days;
    }

    // Checks If It Is Current Month And Year To Set Today Date
    function checkIsSameDay(dayofMonth: number) {
        if (typeof dayofMonth === "number") {
            const today = selectedDate?.set("date", dayofMonth);
            return dayjs().isSame(today, 'day');
        }
        return false;
    }

    //Find Occasions For Selected Month
    function findOccasionsForMonth() {
        setthisMonthsHolidays(structuredClone(occasions).filter(occ => {
            const occassionMonth = dayjs(occ.date).month();
            return selectedDate?.month() === occassionMonth;
        }))
    }

    //Sets anchor to popover
    function handlePopoverOpen(event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(event.currentTarget);
    }

    //Removes anchor
    function handlePopoverClose() {
        setAnchorEl(null);
    }

    //Sets the anchor element only if there is an occasion on the selected date
    function checkForOccasionForDate(day: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        let dateCheck: boolean = false
        const dateOccasions: Array<CalendarItem> = []
        thisMonthsHolidays.length > 0 &&
            thisMonthsHolidays.map((holiday) => {
                const holidayDate = dayjs(holiday.date).date();
                if (holidayDate == day) {
                    dateCheck = true
                    dateOccasions.push(holiday)
                }
            }
            )

        if (dateCheck) {
            setSelectedDateOccasions(dateOccasions)
            showDayOccassion(event)
        }
    }

    //Sets Anchor For Small Screen
    function showDayOccassion(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setSmlScreenAnchr(event.currentTarget);
    }

    function handleCloseSmlPopover() {
        setSmlScreenAnchr(null)
    }

    useEffect(() => {
        findOccasionsForMonth();
    }, [selectedDate, occasions]);

    useEffect(() => {
        setMonthDays(getDaysInCurrentMonth())
    }, [selectedDate])

    return (
        <Box
            component={"div"}
            className="gap-4 calendar-days"
            sx={{
                height: "100%",
            }}
        >
            <Card className="calendar-days-grid" >
                {
                    weekDays.map((weekDay, index) => {
                        return (
                            <Box
                                component="div"
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
                                    {isSmallScreen ? weekDay.at(0) : weekDay}
                                </Typography>
                            </Box>
                        );
                    })}
            </Card>
            <Box className="calendar-days-grid" >
                {monthDays.map((day, index) => {
                    return (
                        <Box key={index}
                            component="div"
                            onClick={(e) => {
                                if (typeof day === "number") {
                                    const updatedDate = dayjs(selectedDate).set("date", day);
                                    handleSelectedDateChange(updatedDate)
                                }
                                if (isSmallScreen && typeof day === "number") {
                                    checkForOccasionForDate(day, e)
                                }
                            }}
                            className={clsx("hover-theme-color calendar-day", { "hover-theme-light": theme === "light", "hover-theme-dark": theme === "dark", "selected-day": selectedDate?.date() === day })}
                        >
                            <Typography variant="h6" className={clsx({ "today": checkIsSameDay(day as number) })}
                                sx={{
                                    fontSize: '28px',
                                    '@media (max-width: 1200px)': {
                                        fontSize: '20px'
                                    },
                                    '@media (max-width: 960px)': {
                                        fontSize: '18px'
                                    },
                                    '@media (max-width: 600px)': {
                                        fontSize: '16px'
                                    }
                                }}
                            >
                                {typeof day === "number" ? day.toString().padStart(2, "0") : day}
                            </Typography>
                            <Box component={'div'}
                                className=
                                'd-flex w-100 flex-column'
                                sx={{
                                    maxHeight: '65px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                }}
                            >
                                <Box component={'div'}
                                    className="d-flex flex-column gap-2 w-100 "
                                >
                                    {thisMonthsHolidays.length > 0 &&
                                        thisMonthsHolidays.map((holiday, index) => {
                                            const holidayDate = dayjs(holiday.date).format("DD");

                                            if (holidayDate == day) {
                                                return (
                                                    <Tooltip key={index}
                                                        slotProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    padding: 1,
                                                                    backgroundColor: theme === "dark" ? "common.black" : "common.white",
                                                                    color: theme === "light" ? 'black' : "white",
                                                                    boxShadow: 10
                                                                },
                                                            },
                                                            arrow: {
                                                                sx: {
                                                                    color: theme === "dark" ? "common.black" : "common.white"
                                                                }
                                                            }
                                                        }}
                                                        title={<ToolTipPopOver holiday={holiday} />}
                                                    >
                                                        {!isSmallScreen ?
                                                            <Box
                                                                key={index}
                                                                className={`calendar-day-holiday ${holiday.type == 1 ? 'primary' :
                                                                    holiday.type == 2 ? 'secondary' :
                                                                        holiday.type == 3 ? 'success' :
                                                                            holiday.type == 4 ? 'info' : ''}`}
                                                                aria-owns={popoverOpen ? String(index) : undefined}
                                                                aria-haspopup="true"
                                                                onMouseEnter={handlePopoverOpen}
                                                                onMouseLeave={handlePopoverClose}
                                                            >

                                                                {holiday.name.length > 10
                                                                    ? holiday.name
                                                                        .split("")
                                                                        .splice(0, 9)
                                                                        .join("") + "..."
                                                                    : holiday.name}
                                                            </Box>
                                                            : <Box
                                                                key={index}
                                                                className={`calendar-day-holiday-dot holiday-dot-color
                                                }`}
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
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            <Popover
                open={open}
                anchorEl={smlScreenAnchr}
                onClose={handleCloseSmlPopover}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Box component='div' className="d-flex flex-column gap-1 p-2">
                    {selectedDateOccasions.map((occ, index) => {
                        return (<Box
                            component="div"
                            className={clsx("d-flex gap-2 align-items-center p-2 rounded", { "primary": occ.type === 1, "secondary": occ.type === 2, "success": occ.type === 3, "info": occ.type === 4 })}
                            key={index}>
                            {occ.imageUrl ? (
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                    }}
                                    src={String(occ.imageUrl)}
                                    variant="rounded"
                                />
                            ) : (
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    <CalendarToday className="fs-32" />
                                </Avatar>
                            )}
                            <Box component={"div"} className="d-flex flex-column ">
                                <Typography variant="body1"
                                    sx={{
                                        fontWeight: '600',
                                        color: "inherit"
                                    }}
                                >{occ.name}</Typography>
                                <Typography variant="body1"
                                    sx={{
                                        fontWeight: '400',
                                        color: "inherit"
                                    }}
                                >{occ.description}
                                </Typography>
                            </Box>
                        </Box>)
                    })}
                </Box>
            </Popover>
        </Box>
    );
}

type PropType = {
    holiday: CalendarItem;
};

const ToolTipPopOver = ({ holiday }: PropType) => {
    return (
        <Box component="div" className="d-flex gap-2 align-items-center ">
            {holiday.imageUrl ? (
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        boxShadow: 2,
                        bgcolor: "secondary.main",
                    }}
                    src={String(holiday.imageUrl)}
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
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>{holiday.name}</Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {holiday.description}
                </Typography>
            </Box>
        </Box>
    );
};
