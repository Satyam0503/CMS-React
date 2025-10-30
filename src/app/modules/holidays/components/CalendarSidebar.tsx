import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import UpcomingHolidayCard from './UpcomingHolidayCard';
import HolidayForm from './HolidayForm';
import { CalendarItem } from '../models';
import dayjs from 'dayjs';
import { hasModuleFeaturePermission } from '../../../../utils/common';
import { ModulesName, Permission } from '../../../../utils/enums';
import { useAppSelector } from '../../../Redux/hooks';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import CakeIcon from '@mui/icons-material/Cake';
import CelebrationIcon from '@mui/icons-material/Celebration';


type Props= {
    occasions: Array<CalendarItem>,
    selectedDate: string | undefined ,
    selectedMonth: string | undefined,
    selectedYear: string | undefined,
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

export default function CalendarSidebar(props: Props) {
    const { formatMessage: i } = useIntl();

    const [upcomingHolidays,setUpcomingHolidays] = useState<Array<CalendarItem>>([])
    const [daysHolidays,seDaysHolidays] = useState<Array<CalendarItem>>([])
    const [open,setOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);
    const [holidaysMonth, setHolidysMonth] = useState<number>(0)
    const [eventsMonth, setEventsMonth] = useState<number>(0)
    const [birthdaysMonth, setBirthdaysMonth] = useState<number>(0)
    const [anniversariesMonth, setAnniversariesMonth] = useState<number>(0)

    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
    
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Create, modulePermission);

    function handleClose(){
        setOpen(false);
        props.handleRefresh()
        setIsEdit(false);
        setInitialHolidayValues(initialValues);
    }

    //Finds Selected Occasions For Selected Month
    function findOccasionsForMonth(){
        let thisMonthHolidaysFinder: Array<CalendarItem> = []

        const todayDate = dayjs().format('DD');
        const todayMonth = dayjs().format('MM')

        props.occasions.forEach((occ)=>{
            if(occ.date){
                const holidayDate = dayjs(occ.date).format('DD');
                const holidayMonth = dayjs(occ.date).format('MM');

                if(props.selectedMonth && props.selectedYear && props.selectedDate){
                    if(holidayMonth == todayMonth && holidayDate > todayDate){
                            thisMonthHolidaysFinder.push(occ)
                        }
                    }
                }
                setUpcomingHolidays(thisMonthHolidaysFinder)
            }
        )
    }

    //Finds All Occasions For Selected Month
    function findAllOccasionsForMonth(){
        let thisMonthHolidaysFinder: Array<CalendarItem> = []

        props.allOccasionsForYear.forEach((occ)=>{
            const holidayMonth: String = String(Number(dayjs(occ.date).format('MM')) - 1) ;
            
            if(props.selectedMonth){
                if(holidayMonth == props.selectedMonth){
                        thisMonthHolidaysFinder.push(occ)
                    }
                }
            }
        )

        let holidayCounter = 0
        let eventCounter = 0
        let birthdayCounter = 0
        let anniversaryCounter = 0

        thisMonthHolidaysFinder.forEach((occ)=>{
            if(occ.type === 1){
                holidayCounter++
            }else if(occ.type === 2){
                eventCounter++
            }else if(occ.type === 3){
                birthdayCounter++
            }else if(occ.type === 4){
                anniversaryCounter++
            }else return
        })

        setHolidysMonth(holidayCounter)
        setEventsMonth(eventCounter)
        setBirthdaysMonth(birthdayCounter)
        setAnniversariesMonth(anniversaryCounter)
    }

    //Finds Occasions For Selected Day
    function findHolidaysForDay(){
        if(props.selectedDate && props.selectedMonth && props.selectedYear && props.occasions){
            const holidayArray: Array<CalendarItem> = []
            props.occasions.forEach((occ)=>{
                const holDate = dayjs(occ.date).format('DD')
                const holMonth = dayjs(occ.date).format('MM')
                
                if(holDate == props.selectedDate && holMonth == String(parseInt(String(props.selectedMonth))+1).padStart(2,'0')){
                    holidayArray.push(occ)
                }
            })
            seDaysHolidays(holidayArray)
        }
    }

    useEffect(() => {
        findOccasionsForMonth()
    }, [props.occasions, props.isRefresh]);

    useEffect(() => {
        findHolidaysForDay()
        findAllOccasionsForMonth()
    }, [props.selectedDate, props.selectedMonth, props.selectedYear, props.occasions]);

    return (
        <Stack
        className='gap-8 calendar-sidebar'
        sx={{backgroundColor:"background.card"}}
        >
            <HolidayForm open={open} handleClose={handleClose} isEdit={isEdit} handleRefresh={props.handleRefresh} initialValues={initialHolidayValues}/>
            {
            // Add New Occasion Section
            hasAddPermission &&
                <Button  variant="contained"
                    className='gap-2'
                    sx={{
                        width:'100%',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '16px'
                    }}
                    onClick={()=>setOpen(true)}
                >
                    {i({ id: "OCCASION.ADD_OCCASION" })}
                    <AddIcon />
                </Button>
            }

            {/* Upcoming Occasions For Current Month */}
            <Box component={'div'}
                className='d-flex flex-column gap-3 calendar-sidebar-upcoming'
            >
                <Typography variant='body1'
                    sx={{ 
                        fontWeight: '600',
                        fontSize:16
                    }}
                >
                    {i({ id: "OCCASION.UPCOMING_OCCASIONS" })}
                </Typography>
                <Box component={'div'}
                    className='gap-4 align-items-center calendar-sidear-holidays-holder'
                >
                    {upcomingHolidays.length > 0 && upcomingHolidays.map((hol,index)=>{
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
            }}/>
            </Box>


            {/* Occasions For Selected Month */}
            <Box component={'div'}
                className='d-flex flex-column gap-3 calendar-sidebar-upcoming'
            >
                <Typography variant='body1'
                    sx={{ 
                        fontWeight: '600',
                        fontSize:16
                    }}
                >
                    {i({ id: "OCCASION.MONTH_OVERVIEW" })}
                </Typography>
                <Box component={'div'}
                    className='gap-4 align-items-center calendar-sidear-holidays-holder'
                >
                    <Box component={'div'} className='occasion-type primary'>
                        <Box component={'div'} className="icon-container primary">
                            <CalendarMonthIcon />
                        </Box>
                        <Typography variant="h6" className='primary'>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</Typography>
                        <Box component={'div'} className="count-div holiday-colors">
                            <Typography variant="body1">{holidaysMonth}</Typography>
                        </Box>
                    </Box>
                    <Box component={'div'} className='occasion-type secondary'>
                        <Box component={'div'} className="icon-container secondary">
                            <EventIcon />
                        </Box>
                        <Typography variant="h6"  className='secondary'>{i({ id: "OCCASION.TYPES.EVENT" })}</Typography>
                        <Box component={'div'} className="count-div event-colors">
                            <Typography variant="body1">{eventsMonth}</Typography>
                        </Box>
                    </Box>
                    <Box component={'div'} className='occasion-type success'>
                        <Box component={'div'} className="icon-container success">
                            <CakeIcon />
                        </Box>
                        <Typography variant="h6"  className='success'>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</Typography>
                        <Box component={'div'} className="count-div bithdays-colors">
                            <Typography variant="body1">{birthdaysMonth}</Typography>
                        </Box>
                    </Box>
                    <Box component={'div'} className='occasion-type info'>
                        <Box component={'div'} className="icon-container info">
                            <CelebrationIcon />
                        </Box>
                        <Typography variant="h6" className='info'>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</Typography>
                        <Box component={'div'} className="count-div anivaesary-colors">
                            <Typography variant="body1" >{anniversariesMonth}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider sx={{
                    borderColor: 'black'
                }}/>
            </Box>

            
            {/* Occasions For Selected Day */}
            <Box component={'div'}
            className='d-flex flex-column gap-3 calendar-sidebar-upcoming align-items-start'
            >
                {daysHolidays.length > 0 && <>
                    <Typography variant='body1'
                    sx={{ 
                        fontWeight: '600',
                        fontSize:16
                    }}
                >
                        {i({ id: "OCCASION.OCCASIONS_ON_DATE" })}
                    </Typography>
                    <Box component={'div'}
                        className='gap-4 align-items-center calendar-sidear-holidays-holder w-100'
                    >
                        {daysHolidays.map((hol,index)=>{
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
