import React, { useEffect, useState } from 'react'
import CalendarSidebar from './components/CalendarSidebar'
import CalendarHeader from './components/CalendarHeader'
import CalendarDays from './components/CalendarDays'
import { Box, SelectChangeEvent } from '@mui/material'
import { Dayjs } from 'dayjs'
import { usePageData } from '../../Context/PageDataProvider'
import { useIntl } from 'react-intl'
import { CalendarItem, CalendarItemType, GetCalendarItemPayload } from './models'
import { getAllCalendarItem } from './holidayServices'



export default function Calendar() {
    const { formatMessage: i } = useIntl();
    const { setPageTitle } = usePageData();
    const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
    const [category, setCategory] = useState<null | CalendarItemType>(0);
    const [selectedDate, setSelectedDate] = useState<string>()
    const [selectedMonth, setSelectedMonth] = useState<string>()
    const [selectedYear, setSelectedYear] = useState<string>()
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState<boolean>(false);
    // const [allOccasionsForYear, setAllOccasionsForYear] = useState<CalendarItem[]>([])

    const handleChange = (event: SelectChangeEvent<unknown>) => {
        setCategory(event.target.value as CalendarItemType);
    };

    //Selects the date
    function handleSelectDate(date: string) {
        if (parseInt(date) > 0) {
            setSelectedDate(date)
        }
    }

    //Used to refresh after changes made
    function handleRefresh() {
        setRefresh(!isRefresh)
    }

    //Handles the selection of full date
    function handleSetCurrentYear(date: Dayjs | null) {
        if (date) {
            setSelectedYear(String(date?.year()))
            setSelectedMonth(String(date?.month()))
            setSelectedDate(String(date?.date()))
        }
    }

    //Increases the month counter by 1
    function addMonth() {
        if (selectedMonth) {
            if (parseInt(selectedMonth) === 11) {
                if (selectedYear) {
                    const newYear = parseInt(selectedYear) + 1
                    setSelectedYear(String(newYear))
                    setSelectedMonth("00")
                }
            } else {
                const newMonth = parseInt(selectedMonth) + 1
                setSelectedMonth(String(String(newMonth)))
            }
        }
    }

    //Descreases the month counter by 1
    function decreaseMonth() {
        if (selectedMonth) {
            if (parseInt(selectedMonth) === 0) {
                if (selectedYear) {
                    const newYear = parseInt(selectedYear) - 1
                    setSelectedYear(String(newYear))
                    setSelectedMonth("11")
                }
            } else {
                const newMonth = parseInt(selectedMonth) - 1
                setSelectedMonth(String(newMonth))
            }
        }
    }

    // fetch all the items for selected year
    useEffect(() => {
        setLoading(true);
        const payload: GetCalendarItemPayload = {
            type: category == 0 ? null : category,
            year: Number(selectedYear)
        };
        const fetchedHolidayData = async () => {
            try {
                const { data } = await getAllCalendarItem(payload);
                if (data.success) setCalendarItems(data.methodResults);
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchedHolidayData()
    }, [selectedYear, isRefresh, category]);

    // useEffect(() => {
    //     setLoading(true);
    //     const payload: GetCalendarItemPayload = {
    //         type: null,
    //         year: Number(selectedYear)
    //     };
    //     const fetchedHolidayData = async () => {
    //         try {
    //             const response = await getAllCalendarItem(payload);
    //             const { success, methodResults, } = response.data;
    //             // console.log(methodResults);

    //             if (success) setAllOccasionsForYear(methodResults);
    //         } catch (error) {
    //             console.error((error as Error).message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     fetchedHolidayData()
    // }, [selectedYear, isRefresh]);

    useEffect(() => {
        const date = new Date;
        setSelectedDate(String(date.getDate()).padStart(2, '0'))
        setSelectedMonth(String(date.getMonth()))
        setSelectedYear(String(date.getFullYear()))
        setPageTitle(i({ id: "PAGE.CALENDAR" }))
    }, [])

    return (
        <>
            <Box component={'div'}
                className='main-holiday-calendar gap-4'
            >
                <CalendarSidebar
                    occasions={calendarItems}
                    selectedDate={selectedDate}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    handleRefresh={handleRefresh}
                    isRefresh={isRefresh}
                    allOccasionsForYear={calendarItems}
                />
                <Box component='div'
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
                        handleChange={handleChange}
                        category={category}
                    />
                    <CalendarDays
                        selectedDate={selectedDate}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        handleSelectDate={handleSelectDate}
                        occasions={calendarItems}
                        handleRefresh={handleRefresh}
                    />
                </Box>
            </Box>
        </>
    )
}