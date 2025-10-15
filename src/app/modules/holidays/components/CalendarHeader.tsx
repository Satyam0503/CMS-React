import { Box, Button, Card, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomisedDatePicker from '../../../shared/components/CustomisedDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { HolidayResponseModel } from '../models';

type Props = {
    selectedDate: string | undefined,
    selectedMonth: string | undefined,
    selectedYear: string | undefined,
    decreaseMonth: () => void,
    addMonth: () => void,
    handleSetCurrentYear: (year: Dayjs | null) => void,
}

export default function CalendarHeader(props: Props) {
    return (
        <Card
            className='calendar-header'
        >
            <Box component={'div'}
            className='calendar-controls'
            >
                
                <IconButton 
                    sx={{
                        display: {
                                xs: "none",
                                sm: "flex",
                                md: "flex",
                                lg: "flex",
                                xl: "flex",
                                xxl: "flex",
                            },
                        '&:hover':{
                            borderColor: '#9a56d3',
                            
                        }
                    }}

                    onClick={props.decreaseMonth}
                >
                    <KeyboardArrowLeftIcon />
                </IconButton>
                {props.selectedYear && props.selectedMonth && props.selectedDate &&
                    <Box component="div"  className="reset-padding"> 
                        <CustomisedDatePicker 
                            value={dayjs(new Date(parseInt(props.selectedYear),parseInt(props.selectedMonth),parseInt(props.selectedDate)))} 
                            views={['year','month', 'day']} 
                            setValue={props.handleSetCurrentYear}
                            className='calendar-input'
                            format="DD MMMM YYYY"
                            />
                    </Box>
                }
                
                <IconButton 
                sx={{
                    display: {
                                xs: "none",
                                sm: "flex",
                                md: "flex",
                                lg: "flex",
                                xl: "flex",
                                xxl: "flex",
                            },
                        '&:hover':{
                            borderColor: '#9a56d3'
                        }
                    }}
                onClick={props.addMonth}
                >
                    <KeyboardArrowRightIcon/>
                </IconButton>
                
            </Box>
        </Card>
    )
}
