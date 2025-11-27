import React, { useEffect, useState } from 'react'
import CalendarSidebar from './components/CalendarSidebar'
import CalendarHeader from './components/CalendarHeader'
import CalendarDays from './components/CalendarDays'
import { Box } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { usePageData } from '../../Context/PageDataProvider'
import { useIntl } from 'react-intl'
import { CalendarItem, CalendarItemType, GetCalendarItemPayload } from './models'
import { getAllCalendarItem } from './calendarServices'



export default function Calendar() {
    const { formatMessage: i } = useIntl();
    const { setPageTitle } = usePageData();
    const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
    const [category, setCategory] = useState<CalendarItemType>(0);
    const [, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())

    const handleCategoryChange = (category: CalendarItemType) => {
        setCategory(category);
    };

    function handleRefresh() {
        setRefresh(!isRefresh)
    }

    const handleSelectedDateChange = (updatedDate: Dayjs | null) => {
        setSelectedDate(updatedDate);
    }

    // fetch all the items for selected year
    useEffect(() => {
        setLoading(true);
        const payload: GetCalendarItemPayload = {
            type: category == 0 ? null : category,
            year: selectedDate ? selectedDate.year() : dayjs().year()
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
    }, [selectedDate?.year(), isRefresh, category]);

    useEffect(() => {
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
                    handleRefresh={handleRefresh}
                    isRefresh={isRefresh}
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
                        handleSelectedDateChange={handleSelectedDateChange}
                        handleCategoryChange={handleCategoryChange}
                        category={category}
                    />
                    <CalendarDays
                        selectedDate={selectedDate}
                        handleSelectedDateChange={handleSelectedDateChange}
                        occasions={calendarItems}
                        handleRefresh={handleRefresh}
                    />
                </Box>
            </Box>
        </>
    )
}