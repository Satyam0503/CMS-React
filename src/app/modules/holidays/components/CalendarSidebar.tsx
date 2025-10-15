import { Box, Button, Card, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import UpcomingHolidayCard from './UpcomingHolidayCard';
import HolidayForm from './HolidayForm';
import { HolidayModel, HolidayResponseModel } from '../models';
import dayjs from 'dayjs';
import { hasModuleFeaturePermission } from '../../../../utils/common';
import { ModulesName, Permission } from '../../../../utils/enums';
import { useAppSelector } from '../../../Redux/hooks';


type Props= {
    holidays: Array<HolidayModel>,
    selectedDate: string | undefined ,
    selectedMonth: string | undefined,
    selectedYear: string | undefined,
    handleRefresh: () => void,
    isRefresh: boolean,
}

const initialValues: HolidayModel = {
    holidayId: "",
    holidayName: "",
    holidayType: 1,
    date: dayjs(Date.now()),
    detail: "",
};

export default function CalendarSidebar(props: Props) {
    const { formatMessage: i } = useIntl();
    const [upcomingHolidays,setUpcomingHolidays] = useState<Array<HolidayModel>>([])
    const [daysHolidays,seDaysHolidays] = useState<Array<HolidayModel>>([])
    const [open,setOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);
    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];

    const hasAddPermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Create, modulePermission);

    function handleClose(){
        setOpen(false);
        props.handleRefresh()
        setIsEdit(false);
        setInitialHolidayValues(initialValues);
    }

    function findHolidayForMonth(){
        let thisMonthHolidaysFinder: Array<HolidayModel> = []

        const todayDate = dayjs().format('DD');
        const todayMonth = dayjs().format('MM')
        const todayYear = dayjs().format('YYYY')
        
        props.holidays.forEach((hol)=>{
            
            if(hol.date){
                const holidayDate = dayjs(hol.date).format('DD');
                const holidayMonth = dayjs(hol.date).format('MM');
                const holidayYear = dayjs(hol.date).format('YYYY');

                if(props.selectedMonth && props.selectedYear && props.selectedDate){
                    if(holidayMonth == todayMonth && todayYear == holidayYear && holidayDate > todayDate){
                            thisMonthHolidaysFinder.push(hol)
                        }
                    }
                }
                setUpcomingHolidays(thisMonthHolidaysFinder)
            }
        )
    }

    function findHolidaysForDay(){
        if(props.selectedDate && props.selectedMonth && props.selectedYear && props.holidays){
            const holidayArray: Array<HolidayModel> = []
            props.holidays.forEach((hol)=>{
                const holDate = dayjs(hol.date).format('DD')
                const holMonth = dayjs(hol.date).format('MM')
                const holYear = dayjs(hol.date).format('YYYY')
                
                if(holDate == props.selectedDate && holMonth == String(parseInt(String(props.selectedMonth))+1) && holYear == props.selectedYear){
                    holidayArray.push(hol)
                }
            })

            seDaysHolidays(holidayArray)
            
        }
    }

    useEffect(() => {
        findHolidayForMonth()
    }, [props.holidays]);  

    useEffect(() => {
        findHolidaysForDay()
    }, [props.selectedDate, props.selectedMonth, props.selectedYear, props.holidays]);

    return (
        <Card
        className='gap-8 calendar-sidebar'
        >
            <HolidayForm open={open} handleClose={handleClose} isEdit={isEdit} handleRefresh={props.handleRefresh} initialValues={initialHolidayValues}/>
            {
            hasAddPermission &&
                <Button  variant="contained"
                    className='gap-2'
                    sx={{
                        width:'100%',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    onClick={()=>setOpen(true)}
                >
                    {i({ id: "HOLIDAY.ADD_HOLIDAYS" })}
                    <AddIcon />
                </Button>
            }
            <Box component={'div'}
                className='d-flex flex-column gap-3 calendar-sidebar-upcoming'
            >
                <Typography variant='h5'
                    sx={{ 
                        fontWeight: '600'
                    }}
                >
                    {i({ id: "HOLIDAY.UPCOMING_HOLIDAYS" })}
                </Typography>
                <Box component={'div'}
                    className='gap-4 align-items-center calendar-sidear-holidays-holder'
                >
                    {upcomingHolidays.length > 0 ? upcomingHolidays.map((hol,index)=>{
                        return <UpcomingHolidayCard 
                                    key={String(index)}
                                    holiday={hol}
                                    holidayList={props.holidays}
                                    handleRefresh={props.handleRefresh}
                                />
                    })
                    : <Typography
                        variant='h6'
                        sx={{
                            fontWeight: '600'
                        }}
                    >{i({ id: "HOLIDAY.NO_HOLIDAYS_FOUND" })}</Typography>
                }
                </Box>
            </Box>
            <Box component={'div'}
            className='d-flex flex-column gap-3 calendar-sidebar-upcoming align-items-start'
            >{daysHolidays.length <= 0 ? 
                <Typography variant='h5'
                    sx={{ 
                        fontWeight: '600'
                    }}
                >
                    {i({ id: "HOLIDAY.NO_HOLIDAYS_ON_DAY" })}
                </Typography>
                : <>
                    <Typography variant='h5'
                        sx={{ 
                            fontWeight: '600'
                        }}
                    >
                        {i({ id: "HOLIDAY.HOLIDAYS_ON_DATE" })}
                    </Typography>
                    <Box component={'div'}
                        className='gap-4 align-items-center calendar-sidear-holidays-holder w-100'
                    >
                        {daysHolidays.map((hol,index)=>{
                            return <UpcomingHolidayCard 
                                    key={String(index)}
                                    holiday={hol}
                                    holidayList={props.holidays}
                                    handleRefresh={props.handleRefresh}
                                />
                        })}
                    </Box>
                </>
            }
            </Box>
        </Card>
    )
}
