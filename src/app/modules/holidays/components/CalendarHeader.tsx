import { Box, Card, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React from 'react'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CustomisedDatePicker from '../../../shared/components/CustomisedDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useIntl } from 'react-intl';

type Props = {
    category: unknown;
    selectedDate: string | undefined,
    selectedMonth: string | undefined,
    selectedYear: string | undefined,
    decreaseMonth: () => void,
    addMonth: () => void,
    handleSetCurrentYear: (year: Dayjs | null) => void,
    handleChange: (event: SelectChangeEvent<unknown>) => void
}

export default function CalendarHeader(props: Props) {
    const { formatMessage: i } = useIntl();
    return (
        <Card
            className='calendar-header'
        >
            <Box component={'div'}
                className='calendar-controls'
            >
                {props.selectedYear && props.selectedMonth && props.selectedDate &&
                    <Box component="div" className="reset-padding">
                        <CustomisedDatePicker
                            value={dayjs(new Date(parseInt(props.selectedYear), parseInt(props.selectedMonth), parseInt(props.selectedDate)))}
                            views={['year', 'month', 'day']}
                            setValue={props.handleSetCurrentYear}
                            className='calendar-input'
                            format="DD MMMM YYYY"
                        />
                    </Box>
                }
                <IconButton
                    onClick={props.decreaseMonth}
                >
                    <KeyboardArrowLeftIcon />
                </IconButton>

                <IconButton
                    onClick={props.addMonth}
                >
                    <KeyboardArrowRightIcon />
                </IconButton>
            </Box>
            <Box component={'div'} className='calendar-filters'
                sx={{
                    width: '150px'
                }}
            >
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">{i({ id: "OCCASION.TYPES.CATEGORY" })}</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={props.category}
                        label={i({ id: "OCCASION.TYPES.CATEGORY" })}
                        onChange={props.handleChange}
                        size='small'
                    >
                        <MenuItem value={0}>{i({ id: "OCCASION.TYPES.ALL" })}</MenuItem>
                        <MenuItem value={1}>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</MenuItem>
                        <MenuItem value={2}>{i({ id: "OCCASION.TYPES.EVENT" })}</MenuItem>
                        <MenuItem value={3}>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</MenuItem>
                        <MenuItem value={4}>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Card>
    )
}
