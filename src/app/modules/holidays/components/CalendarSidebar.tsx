import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import HolidayForm from './HolidayForm';
import { CalendarItem, GetCalendarItemPayload } from '../models';
import dayjs, { Dayjs } from 'dayjs';
import { formatServerDate, hasModuleFeaturePermission } from '../../../../utils/common';
import { ModulesName, Permission } from '../../../../utils/enums';
import { useAppSelector } from '../../../Redux/hooks';
import { Cake, CalendarMonth, Celebration, Event } from '@mui/icons-material';
import { getAllCalendarItem } from '../calendarServices';
import { UpcomingHolidayCard } from './UpcomingHolidayCard';



import { AppButton } from "../../../shared/components/ui";
type Props = {
    occasions: Array<CalendarItem>,
    selectedDate: Dayjs | null,
    handleRefresh: () => void,
    isRefresh: boolean,
}

const initialValues: CalendarItem = {
    id: "",
    name: "",
    type: 1,
    date: dayjs(Date.now()),
    description: "",
    recurring: false,
    imageUrl: null
};

const CalendarItems = [
    {
        key: "holidays",
        name: 'HOLIDAY',
        theme: 'primary',
        colors: 'holiday-colors',
        icon: <CalendarMonth />
    }, {
        key: "events",
        name: 'EVENT',
        theme: 'secondary',
        colors: 'event-colors',
        icon: <Event />
    }, {
        key: "birthdays",
        name: 'BIRTHDAY',
        theme: 'success',
        colors: 'bithdays-colors',
        icon: <Cake />
    }, {
        key: "anniversaries",
        name: 'ANNIVERSARY',
        theme: 'info',
        colors: 'anivaesary-colors',
        icon: <Celebration />
    },
]

export default function CalendarSidebar(props: Props) {
    const { formatMessage: i } = useIntl();
    const [daysHolidays, setDaysHolidays] = useState<Array<CalendarItem>>([])
    const [open, setOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);

    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.Calendar, Permission.Create, modulePermission);
    const [allOccasionsForYear, setAllOccasionsForYear] = useState<CalendarItem[]>([])

    const [monthSummary, setMonthSummary] = useState({
        holidays: 0,
        events: 0,
        birthdays: 0,
        anniversaries: 0
    } satisfies Record<string, number>);

    useEffect(() => {
        const payload: GetCalendarItemPayload = {
            type: null,
            year: props.selectedDate ? props.selectedDate.year() : dayjs().year()
        };
        const fetchedHolidayData = async () => {
            try {
                const response = await getAllCalendarItem(payload);
                const { success, methodResults } = response.data;
                if (success) setAllOccasionsForYear(methodResults);
            } catch (error) {
                console.error((error as Error).message);
            }
        }

        fetchedHolidayData()
    }, [props.selectedDate?.year(), props.isRefresh]);

    function handleClose() {
        setOpen(false);
        props.handleRefresh()
        setIsEdit(false);
        setInitialHolidayValues(initialValues);
    }

    //Finds Selected Occasions For Selected Month
    function findUpComingOccassions() {
        const today = dayjs();
        if (allOccasionsForYear.length === 0) return [];
        const thisMonthHolidaysFinder = allOccasionsForYear.filter((occ) => {
            if (!occ.date) return false;
            const occDate = dayjs(formatServerDate(occ.date, "YYYY-MM-DD"));
            return occDate.isAfter(today);
        }).sort((a, b) => dayjs(formatServerDate(a.date, "YYYY-MM-DD")).diff(dayjs(formatServerDate(b.date, "YYYY-MM-DD")))).slice(0, 4);

        // Update state with the filtered holidays
        return thisMonthHolidaysFinder;
    }

    // get month summary
    function getMonthSummary() {
        let holidayCounter = 0
        let eventCounter = 0
        let birthdayCounter = 0
        let anniversaryCounter = 0

        props.occasions.filter(occ => {
            const holidayMonth = dayjs(formatServerDate(occ.date, "YYYY-MM-DD")).month();
            return holidayMonth === props.selectedDate?.month();
        }).forEach((occ) => {
            if (occ.type === 1) {
                holidayCounter++
            } else if (occ.type === 2) {
                eventCounter++
            } else if (occ.type === 3) {
                birthdayCounter++
            } else if (occ.type === 4) {
                anniversaryCounter++
            } else return
        })
        setMonthSummary({
            holidays: holidayCounter,
            events: eventCounter,
            birthdays: birthdayCounter,
            anniversaries: anniversaryCounter
        })
    }

    //Finds Occasions For Selected Day
    function findHolidaysForDay() {
        setDaysHolidays(props.occasions.filter(occ => {
            const occassionDate = dayjs(formatServerDate(occ.date, "YYYY-MM-DD"));
            return occassionDate.date() === props.selectedDate?.date() && occassionDate.month() === props.selectedDate.month();
        }))
    }

    useEffect(() => {
        findHolidaysForDay()
        getMonthSummary()
    }, [props.selectedDate, props.occasions]);

    return (
        <Stack
            className='gap-8 calendar-sidebar'
            sx={{
                backgroundColor: "background.card",
                animation: "calendar-sidebar-enter 360ms ease-out both",
                "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                },
            }}
        >
            <HolidayForm open={open} handleClose={handleClose} isEdit={isEdit} handleRefresh={props.handleRefresh} initialValues={initialHolidayValues} />
            {
                // Add New Occasion Section
                hasAddPermission &&
                <AppButton variant="contained"
                    sx={{
                        width: 1,
                        fontSize: 14,
                        minHeight: 44,
                    }}
                    onClick={() => setOpen(true)}
                >
                    {i({ id: "BUTTON.ADD" })}
                    <AddIcon />
                </AppButton>
            }

            {/* Occasions For Selected Month */}
            <Box component={'div'}
                className='gap-3 calendar-sidebar-upcoming'
            >
                <Typography variant='body1' className='fs-16 fw-bold' >
                    {i({ id: "OCCASION.MONTH_OVERVIEW" })}
                </Typography>
                <Box component={'div'}
                    className='gap-4 calendar-sidear-holidays-holder calendar-summary-grid'
                >
                    {CalendarItems.map((item, index) => {
                        return (
                            <Box component='div' className={`occasion-type ${item.theme}`} key={index}>
                                <Box component='div' className={`icon-container ${item.theme}`}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" className={`${item.theme}`}>{i({ id: `OCCASION.TYPES.${item.name}` })}</Typography>
                                <Box component='div' className={`count-div ${item.colors}`}>
                                    {monthSummary[item.key as keyof typeof monthSummary]}
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
            </Box>

            {/* Upcoming Occasions For Current Month */}
            {findUpComingOccassions().length > 0 &&
                <Box component='div'
                    className='gap-3 calendar-sidebar-upcoming'
                >
                    <Typography variant='body1' className='fs-16 fw-bold' >
                        {i({ id: "OCCASION.UPCOMING_OCCASIONS" })}
                    </Typography>
                    <Box component='div'
                        className='gap-1 calendar-sidear-holidays-holder'
                    >
                        {findUpComingOccassions().map((hol, index) => {
                            return <UpcomingHolidayCard
                                key={String(index)}
                                occasion={hol}
                                occasions={props.occasions}
                                handleRefresh={props.handleRefresh}
                            />
                        })
                        }
                    </Box>

                </Box>
            }


            {/* Occasions For Selected Day */}
            <Box component={'div'}
                className='gap-3 calendar-sidebar-upcoming'
            >
                {daysHolidays.length > 0 &&
                    <>
                        <Typography variant='body1' className='fs-16 fw-bold' >
                            {i({ id: "OCCASION.OCCASIONS_ON_DATE" })}
                        </Typography>
                        <Box component={'div'}
                            className='gap-1 calendar-sidear-holidays-holder'
                        >
                            {daysHolidays.map((hol, index) => {
                                return <UpcomingHolidayCard
                                    key={String(index)}
                                    occasion={hol}
                                    occasions={props.occasions}
                                    handleRefresh={props.handleRefresh}
                                />
                            })}
                        </Box>
                    </>
                }
            </Box>
        </Stack>
    )
}
