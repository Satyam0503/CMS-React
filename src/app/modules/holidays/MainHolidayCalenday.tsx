import React, { useEffect, useState } from 'react'
import CalendarSidebar from './components/CalendarSidebar'
import CalendarHeader from './components/CalendarHeader'
import CalendarDays from './components/CalendarDays'
import { Box } from '@mui/material'
import { Dayjs } from 'dayjs'
import { usePageData } from '../../Context/PageDataProvider'
import { useIntl } from 'react-intl'
import { initialFilterValues } from './components/HolidayFilter'
import { getAllHolidays } from './holidayServices'
import { GetHolidayPayloadModel, HolidayModel, HolidayResponseModel } from './models'
import { useAppSelector } from '../../Redux/hooks'

export default function MainHolidayCalenday() {
    const { formatMessage: i } = useIntl();

    const { setPageTitle } = usePageData();
    const [selectedDate,setSelectedDate] = useState<string>()
    const [selectedMonth,setSelectedMonth] = useState<string>()
    const [selectedYear,setSelectedYear] = useState<string>()
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [holidayList, setHolidayList] = useState<HolidayResponseModel[]>([]);
    const [isRefresh, setRefresh] = useState(false);

    const holidayFilters = useAppSelector((state) => state.filters.holiday);

    const eventsList: Array<HolidayResponseModel> = [{
        holidayId: "1",
        holidayName: "Demo",
        holidayType: 2,
        date: '10-15-2025',
        holidayImageUrl: 'https://placehold.net/400x400.png',
        detail: 'This will be a test'
    },{
        holidayId: "2",
        holidayName: "Demo",
        holidayType: 2,
        date: '11-15-2025',
        holidayImageUrl: 'https://placehold.net/400x400.png',
        detail: 'This will be a test'
    },{
        holidayId: "3",
        holidayName: "Demo",
        holidayType: 2,
        date: '12-19-2025',
        holidayImageUrl: 'https://placehold.net/400x400.png',
        detail: 'This will be a test'
    },{
        holidayId: "4",
        holidayName: "Demo",
        holidayType: 2,
        date: '01-15-2026',
        holidayImageUrl: 'https://placehold.net/400x400.png',
        detail: 'This will be a test'
    }]

    function handleSelectDate(date: string){
        if(parseInt(date) > 0){
            setSelectedDate(date)
        }
    }

    function handleRefresh(){
        setRefresh(!isRefresh)
    }

    function handleSetCurrentYear(date: Dayjs| null){
        if(date){
            setSelectedYear(String(date?.year()))
            setSelectedMonth(String(date?.month()))
            setSelectedDate(String(date?.date()))
        }
    }

    function addMonth(){
        if(selectedMonth){
            if(parseInt(selectedMonth) === 11){
                if(selectedYear){
                    const newYear = parseInt(selectedYear) + 1
                    setSelectedYear(String(newYear))
                    setSelectedMonth("00")
                }
            }else{
                const newMonth = parseInt(selectedMonth) + 1
                setSelectedMonth(String(String(newMonth)))
            }
        }
    }

    function decreaseMonth(){
        if(selectedMonth){
            if(parseInt(selectedMonth) === 0){
                if(selectedYear){
                    const newYear = parseInt(selectedYear) - 1
                    setSelectedYear(String(newYear))
                    setSelectedMonth("11")
                }
            }else{
                const newMonth = parseInt(selectedMonth) - 1
                setSelectedMonth(String(newMonth))
            }
        }
    }

    useEffect(() => {
            setLoading(true);
            const payload: GetHolidayPayloadModel = {
            holidayName: searchValue,
            ...(
                holidayFilters ?? initialFilterValues
            )
            };
            const fetchedHolidayData = async () => {
            try {
                const response = await getAllHolidays(payload);
                const { success, methodResults, } = response.data;
                if (success) {
                setHolidayList(methodResults);
                }
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setLoading(false);
            }
        }
    
        fetchedHolidayData()
    }, [searchValue, holidayFilters, isRefresh]);

    useEffect(()=>{
        const date = new Date;
        setSelectedDate(String(date.getDate()).padStart(2,'0'))
        setSelectedMonth(String(date.getMonth()))
        setSelectedYear(String(date.getFullYear()))
        setPageTitle(i({ id: "PAGE.HOLIDAYS" }))
    },[])

    // console.log(holidayList);
    

    return (
        <>
            <Box component={'div'}
            className='main-holiday-calendar gap-8'
            >
                <CalendarSidebar 
                    holidays={holidayList}
                    selectedDate={selectedDate} 
                    selectedMonth={selectedMonth} 
                    selectedYear={selectedYear}
                    handleRefresh={handleRefresh}
                    isRefresh={isRefresh}
                    />
                <Box component={'div'}
                className='gap-4'
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                }}>
                    <CalendarHeader 
                        selectedDate={selectedDate} 
                        selectedMonth={selectedMonth} 
                        selectedYear={selectedYear} 
                        addMonth={addMonth} 
                        decreaseMonth={decreaseMonth}
                        handleSetCurrentYear={handleSetCurrentYear}
                    />
                    <CalendarDays
                        selectedDate={selectedDate} 
                        selectedMonth={selectedMonth} 
                        selectedYear={selectedYear}
                        handleSelectDate={handleSelectDate}
                        holidays={holidayList}
                        handleRefresh={handleRefresh}
                    />
                </Box>
            </Box>
        </>
    )
}
