import { parseInterviewCalendarItem } from "../../recruitment/utils/interviewCalendarUtils";
import { InterviewDossierModal } from "../../recruitment/applications/components/InterviewDossierModal";
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
import { calendarItemStyleMapper, dateFormatter, formatServerDate, getOrdinalSuffix } from "../../../../utils/common";


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
    const weekDayShort = typeof dayjs.weekdaysShort === "function" ? dayjs.weekdaysShort() : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const open = Boolean(smlScreenAnchr);
    const [selectedInterview, setSelectedInterview] = useState<CalendarItem | null>(null);

    //Gets number of days in any month
    function getDaysInCurrentMonth() {
        const days: Array<number | string> = [];
        const activeDate = selectedDate ?? dayjs();
        const firstDateOfMonth = activeDate.startOf("month").day();
        const daysInCurrentMonth = activeDate.daysInMonth();

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
            const today = (selectedDate ?? dayjs()).set("date", dayofMonth);
            return dayjs().isSame(today, 'day');
        }
        return false;
    }

    //Find Occasions For Selected Month
    function findOccasionsForMonth() {
        setthisMonthsHolidays(structuredClone(occasions).filter(occ => {
            const occassionMonth = dayjs(formatServerDate(occ.date, "YYYY-MM-DD")).month();
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
        if (thisMonthsHolidays.length > 0) {
            thisMonthsHolidays.forEach((holiday) => {
                const holidayDate = dayjs(formatServerDate(holiday.date, "YYYY-MM-DD")).date();
                if (holidayDate == day) {
                    dateCheck = true
                    dateOccasions.push(holiday)
                }
            });
        }

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
                height: "auto",
                minHeight: 0,
            }}
        >
            <Card className="calendar-days-grid calendar-weekdays" elevation={0}>
                {
                    weekDayShort.map((weekDay, index) => {
                        return (
                            <Box
                                component="div"
                                key={index}
                                className="d-flex justify-content-center align-items-center"
                                sx={{
                                    width: "100%",
                                    height: { xs: 42, sm: 52, md: 64 },
                                    color: index === 0 || index === 6 ? "secondary.main" : "text.secondary",
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: "600",
                                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1.5rem" },
                                    }}
                                >
                                    {isSmallScreen ? weekDay.at(0) : weekDay}
                                </Typography>
                            </Box>
                        );
                    })}
            </Card>
            <Box className="calendar-days-grid calendar-month-grid">
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
                            className={clsx("hover-theme-color calendar-day hover-secondary ", {
                                "selected-day": selectedDate?.date() === day,
                                "today-cell": checkIsSameDay(day as number),
                                "calendar-day-empty": typeof day !== "number",
                            })}
                            sx={{ minHeight: { xs: 64, sm: 88, md: 126 }, ...(checkIsSameDay(day as number) ? { bgcolor: "action.selected", border: "2px solid", borderColor: "primary.main" } : {}) }}
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
                                    maxHeight: { xs: '32px', sm: '48px', md: '65px' },
                                    overflowY: 'auto',
                                    padding: { xs: '2px', sm: '4px', md: '5px' },
                                }}
                            >
                                <Box component={'div'}
                                    className="d-flex flex-column gap-2 w-100 "
                                >
                                    {thisMonthsHolidays.length > 0 &&
                                        thisMonthsHolidays.map((holiday, index) => {
                                            const holidayDate = dayjs(formatServerDate(holiday.date, "YYYY-MM-DD")).format("DD");

                                            if (holidayDate == day) {
                                                return (
                                                    <Tooltip key={index}
                                                        slotProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    padding: 1,
                                                                    backgroundColor: "background.body",
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
                                                                className={`calendar-day-holiday ${calendarItemStyleMapper[holiday.type]} `}
                                                                aria-owns={popoverOpen ? String(index) : undefined}
                                                                aria-haspopup="true"
                                                                onMouseEnter={handlePopoverOpen}
                                                                onMouseLeave={handlePopoverClose}
                                                                onClick={(e) => {
                                                                    const meta = parseInterviewCalendarItem(holiday);
                                                                    if (meta.isInterview) {
                                                                        e.stopPropagation();
                                                                        setSelectedInterview(holiday);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    cursor: parseInterviewCalendarItem(holiday).isInterview ? "pointer" : "default",
                                                                }}
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
                                                                className={`calendar-day-holiday-dot holiday-dot-color`}
                                                                aria-owns={popoverOpen ? String(index) : undefined}
                                                                aria-haspopup="true"
                                                                onMouseEnter={handlePopoverOpen}
                                                                onMouseLeave={handlePopoverClose}
                                                                onClick={(e) => {
                                                                    const meta = parseInterviewCalendarItem(holiday);
                                                                    if (meta.isInterview) {
                                                                        e.stopPropagation();
                                                                        setSelectedInterview(holiday);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    cursor: parseInterviewCalendarItem(holiday).isInterview ? "pointer" : "default",
                                                                }}
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
                <Box component='div' className="d-flex flex-column gap-2 p-2">
                    {selectedDateOccasions.map((occ, index) => {
                        const date = dayjs(occ.date);
                        const meta = parseInterviewCalendarItem(occ);
                        return (<Box
                            component="div"
                            className={`d-flex gap-2 align-items-center rounded `}
                            key={index}
                            onClick={(e) => {
                                if (meta.isInterview) {
                                    e.stopPropagation();
                                    setSelectedInterview(occ);
                                    handleCloseSmlPopover();
                                }
                            }}
                            sx={{ cursor: meta.isInterview ? "pointer" : "default" }}
                        >
                            {occ.imageUrl ? (
                                <Avatar
                                    sx={{
                                        width: 44,
                                        height: 44,
                                    }}
                                    src={String(occ.imageUrl)}
                                    variant="rounded"
                                />
                            ) : (
                                <Box className={`date-box ${calendarItemStyleMapper[occ.type]}`}>
                                    <span>{getOrdinalSuffix(date.date())}</span>
                                    <span>{dateFormatter(date, "MMM")}</span>
                                </Box>
                            )}
                            <Box component="div" className="d-flex flex-column ">
                                <Typography variant="body1"
                                    sx={{
                                        fontWeight: '600',
                                        color: "inherit"
                                    }}
                                >{occ.name}</Typography>
                                <Typography variant="body2"
                                    sx={{
                                        color: "inherit",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    {meta.isInterview ? "📋 Click to open Interview Dossier & Scorecard" : occ.description}
                                </Typography>
                            </Box>
                        </Box>)
                    })}
                </Box>
            </Popover>
            {selectedInterview && (
                <InterviewDossierModal
                    open={Boolean(selectedInterview)}
                    onClose={() => setSelectedInterview(null)}
                    occasion={selectedInterview}
                    onScorecardSubmitted={props.handleRefresh}
                />
            )}
        </Box>
    );
}

type PropType = {
    holiday: CalendarItem;
};

const ToolTipPopOver = ({ holiday }: PropType) => {
    const meta = parseInterviewCalendarItem(holiday);
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
                    {meta.isInterview ? "📋 Click item to open Interview Dossier & Scorecard" : holiday.description}
                </Typography>
            </Box>
        </Box>
    );
};
