import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import UpcomingHolidayCard from './UpcomingHolidayCard';
import HolidayForm from './HolidayForm';
import { CalendarItem } from '../models';
import dayjs, { Dayjs } from 'dayjs';
import { hasModuleFeaturePermission } from '../../../../utils/common';
import { ModulesName, Permission } from '../../../../utils/enums';
import { useAppSelector } from '../../../Redux/hooks';
import { Cake, CalendarMonth, Celebration, Event } from '@mui/icons-material';



type Props = {
    occasions: Array<CalendarItem>,
    selectedDate: Dayjs | null,
    // selectedMonth: string | undefined,
    // selectedYear: string | undefined,
    handleRefresh: () => void,
    isRefresh: boolean,
    allOccasionsForYear: Array<CalendarItem>,
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
    const [upcomingHolidays, setUpcomingHolidays] = useState<Array<CalendarItem>>([])
    const [daysHolidays, setDaysHolidays] = useState<Array<CalendarItem>>([])
    const [open, setOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);

    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.Calendar, Permission.Create, modulePermission);

    const [monthSummary, setMonthSummary] = useState({
        holidays: 0,
        events: 0,
        birthdays: 0,
        anniversaries: 0
    } satisfies Record<string, number>);

    function handleClose() {
        setOpen(false);
        props.handleRefresh()
        setIsEdit(false);
        setInitialHolidayValues(initialValues);
    }

    //Finds Selected Occasions For Selected Month
    function findOccasionsForMonth() {
        const thisMonthHolidaysFinder: Array<CalendarItem> = []

        const todayDate = dayjs().format('DD');
        const todayMonth = dayjs().format('MM')

        props.allOccasionsForYear.forEach((occ) => {
            if (occ.date) {
                const holidayDate = dayjs(occ.date).format('DD');
                const holidayMonth = dayjs(occ.date).format('MM');

                if (props.selectedDate) {
                    if (holidayMonth == todayMonth && holidayDate > todayDate) {
                        thisMonthHolidaysFinder.push(occ)
                    }
                }
            }
            setUpcomingHolidays(thisMonthHolidaysFinder)
        }
        )
    }


    // get month summary
    function getMonthSummary() {
        let holidayCounter = 0
        let eventCounter = 0
        let birthdayCounter = 0
        let anniversaryCounter = 0

        props.allOccasionsForYear.filter(occ => {
            const holidayMonth = dayjs(occ.date).month();
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
            const occassionDate = dayjs(occ.date);
            return occassionDate.date() === props.selectedDate?.date() && occassionDate.month() === props.selectedDate.month();
        }))
    }

    useEffect(() => {
        findOccasionsForMonth()
    }, [props.occasions, props.isRefresh]);

    useEffect(() => {
        findHolidaysForDay()
        getMonthSummary()
    }, [props.selectedDate, props.occasions]);

    return (
        <Stack
            className='gap-8 calendar-sidebar'
            sx={{ backgroundColor: "background.card" }}
        >
            <HolidayForm open={open} handleClose={handleClose} isEdit={isEdit} handleRefresh={props.handleRefresh} initialValues={initialHolidayValues} />
            {
                // Add New Occasion Section
                hasAddPermission &&
                <Button variant="contained"
                    sx={{
                        width: 1,
                        fontSize: 14
                    }}
                    onClick={() => setOpen(true)}
                >
                    {i({ id: "OCCASION.ADD_OCCASION" })}
                    <AddIcon />
                </Button>
            }

            {/* Upcoming Occasions For Current Month */}
            {upcomingHolidays.length > 0 &&
                <Box component='div'
                    className='gap-3 calendar-sidebar-upcoming'
                >
                    <Typography variant='body1' className='fs-16 fw-bold' >
                        {i({ id: "OCCASION.UPCOMING_OCCASIONS" })}
                    </Typography>
                    <Box component={'div'}
                        className='gap-4 calendar-sidear-holidays-holder'
                    >
                        {upcomingHolidays.length > 0 && upcomingHolidays.map((hol, index) => {
                            return <UpcomingHolidayCard
                                key={String(index)}
                                occasion={hol}
                                occasions={props.occasions}
                                handleRefresh={props.handleRefresh}
                            />
                        })
                        }
                    </Box>
                    <Divider sx={{
                        borderColor: 'black'
                    }} />
                </Box>
            }


            {/* Occasions For Selected Month */}
            <Box component={'div'}
                className='gap-3 calendar-sidebar-upcoming'
            >
                <Typography variant='body1' className='fs-16 fw-bold' >
                    {i({ id: "OCCASION.MONTH_OVERVIEW" })}
                </Typography>
                <Box component={'div'}
                    className='gap-4 calendar-sidear-holidays-holder'
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
                <Divider sx={{
                    borderColor: 'black'
                }} />
            </Box>


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
                            className='gap-4 calendar-sidear-holidays-holder'
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
