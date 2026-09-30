/** @format */

import { Dayjs } from "dayjs";
import { DatePicker, DateView, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, SxProps, Theme } from "@mui/material";

interface PropsTypes {
  value: Dayjs | null;
  setValue: (newDate: Dayjs | null) => void;
  label?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  name?: string;
  className?: string;
  disabled?: boolean;
  views?: DateView[];
  format?: string;
  sx?: SxProps<Theme>;
  shouldDisableDate?: (newDate: Dayjs) => boolean;
}

const CustomisedDatePicker = (props: PropsTypes) => {
  const {
    label,
    value,
    setValue,
    maxDate,
    name,
    minDate,
    disabled = false,
    views,
    sx,
    format,
    shouldDisableDate,
  } = props;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <DatePicker
          className="datepicker"
          name={name}
          label={label}
          value={value}
          onChange={(newDate) => {
            setValue(newDate);
          }}
          shouldDisableDate={shouldDisableDate}
          maxDate={maxDate}
          minDate={minDate}
          disabled={disabled}
          views={views}
          format={format}
          slotProps={{
            textField: {
              size: "small",
              className: "w-100",
              sx: {
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  bgcolor: "background.paper",
                },
              },
              inputProps: {
                readOnly: true,
                onKeyDown: (e) => e.preventDefault(),
                onScroll: (e) => e.preventDefault(),
              },
            },
            inputAdornment: {
              sx: {
                "& .MuiIconButton-root": {
                  border: 0,
                  padding: 0,
                },
              },
            },
          }}
          sx={{
            ...sx,
            minWidth: "unset !important",
            width: 1,
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CustomisedDatePicker;
