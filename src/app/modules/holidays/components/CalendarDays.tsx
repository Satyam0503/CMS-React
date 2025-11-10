import {
    Avatar,
    Box,
    Card,
    Divider,
    Popover,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { CalendarItem } from "../models";
import dayjs from "dayjs";
import { CalendarToday } from "@mui/icons-material";
import { useThemeContext } from "../../../Context/ThemeContext";
import clsx from "clsx";

import { useContext } from 'react';
import { ThemeContext } from "@emotion/react";

type Props = {
    selectedDate: string | undefined;
    selectedMonth: string | undefined;
    selectedYear: string | undefined;
    handleSelectDate: (date: string) => void;
    occasions: Array<CalendarItem>;
    handleRefresh: () => void;
};

export default function CalendarDays(props: Props) {
    const [thisMonthsHolidays, setthisMonthsHolidays] = useState<Array<CalendarItem>>([]);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [isTodayMonthYear, setIsTodayMonthYear] = useState<boolean>(true);
    const [smlScreenAnchr, setSmlScreenAnchr] = React.useState<HTMLElement | null>(null);
    const [selectedDateOccasions, setSelectedDateOccasions] = useState<Array<CalendarItem>>([])

    const popoverOpen = Boolean(anchorEl);
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

    const open = Boolean(smlScreenAnchr);

    let days: Array<string> = [];

    getDaysInCurrentMonth(props.selectedMonth, props.selectedYear);

    //Gets number of days in any month
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

    // Checks If It Is Current Month And Year To Set Today Date
    function checkIsCurrentMonthYear() {
        const { selectedDate, selectedMonth, selectedYear } = props;

        if (selectedDate && selectedMonth && selectedYear) {
        const isSameMonthYear =
            Number(selectedMonth) === Number(todayMonth) &&
            Number(selectedYear) === Number(todayYear);

        setIsTodayMonthYear(isSameMonthYear);
        }
    }

    //Find Occasions For Selected Month
    function findOccasionsForMonth() {
        let thisMonthHolidaysFinder: Array<CalendarItem> = [];

        props.occasions.forEach((occ) => {
        if (occ.date) {
            const month = dayjs(occ.date).format("MM")

            let selecMonth = String(
            parseInt(dayjs(`${props.selectedYear}-${props.selectedMonth}-01`).format("MM")) + 1)
            .padStart(2,"0");
            if(selecMonth === '13') selecMonth = '01'
            

            if (month == selecMonth) {
                thisMonthHolidaysFinder.push(occ);
            }
        }
        setthisMonthsHolidays(thisMonthHolidaysFinder);
        });
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
    function checkForOccasionForDate(day: String, event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        let dateCheck:boolean = false
        const dateOccasions: Array<CalendarItem> = []
        thisMonthsHolidays.length > 0 &&
            thisMonthsHolidays.map((holiday, index) => {
                    const holidayDate = dayjs(holiday.date).format("DD");
                        if (holidayDate == day) {
                            dateCheck = true
                            dateOccasions.push(holiday)
                        }
                    }
                )

        if(dateCheck) {
            setSelectedDateOccasions(dateOccasions)
            showDayOccassion(event)
        }
    }

    //Sets Anchor For Small Screen
    function showDayOccassion(event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        setSmlScreenAnchr(event.currentTarget);
    }

    function handleCloseSmlPopover(){
        setSmlScreenAnchr(null)
    }

    useEffect(() => {
        checkIsCurrentMonthYear();
        getDaysInCurrentMonth(props.selectedMonth, props.selectedYear);
        findOccasionsForMonth();
    }, [
        props.selectedDate,
        props.selectedMonth,
        props.selectedYear,
        props.occasions,
    ]);

    return (
        <Box
        component={"div"}
        className="gap-4 calendar-days"
        sx={{
            height: "100%",
        }}
        >
        <Card
            className="gap-4 calendar-days-grid"
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
                        if (screenWidth < 850) {
                            checkForOccasionForDate(String(day),e)
                        }
                    }}
                    className={`hover-theme-color calendar-day ${props.selectedDate == day && "selected-day"} ${theme === 'light' ? 'hover-theme-light' : 'hover-theme-dark'}`}
                >
                    <Typography variant="h6" className={clsx({"today":isTodayMonthYear && day == todayDate})}
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
                            {day}
                    </Typography>
                    <Box component={'div'}
                        className=
                        'd-flex w-100 flex-column'
                        sx={{
                            maxHeight: '65px',
                            overflowY: 'auto',
                            padding : '5px',
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
                                                className={`calendar-day-holiday ${holiday.type == 1 ? 'primary' :
                                                                                    holiday.type == 2 ?'secondary' :
                                                                                    holiday.type == 3 ? 'success' :
                                                                                    holiday.type == 4 ? 'info' : ''}`}
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
                                                    {holiday.name.length > 10
                                                    ? holiday.name
                                                        .split("")
                                                        .splice(0, 9)
                                                        .join("") + "..."
                                                    : holiday.name}
                                                </Typography>
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
        </Card>
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
                <Box component={'div'}
                    className="d-flex flex-column gap-2 p-2"
                >
                    {selectedDateOccasions.map((occ,index)=>{
                        return (<Box 
                                    component={"div"}
                                    className={`d-flex gap-4 align-items-center p-2 rounded ${occ.type == 1 ? 'primary' :
                                                                                    occ.type == 2 ?'secondary' :
                                                                                    occ.type == 3 ? 'success' :
                                                                                    occ.type == 4 ? 'info' : ''}`}
                                    key={index}>
                            {occ.imageUrl ? (
                                <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    boxShadow: 2,
                                    bgcolor: "secondary.main",
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
                                    bgcolor: "secondary.main",
                                }}
                                >
                                <CalendarToday className="fs-32" />
                                </Avatar>
                            )}
                            <Box component={"div"} className="d-flex flex-column ">
                                <Typography variant="body1"
                                    sx={{
                                        fontWeight: '600'
                                    }}
                                >{occ.name}</Typography>
                                <Typography variant="body1"
                                    sx={{
                                        fontWeight: '400'
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
        <Box component={"div"} className="d-flex gap-4 align-items-center ">
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
                <Typography variant="body1">{holiday.name}</Typography>
                <Typography variant="body2">
                {holiday.description}
                </Typography>
            </Box>
        </Box>
    );
};
