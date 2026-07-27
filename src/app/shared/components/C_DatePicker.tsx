/** @format */

import { Dayjs } from "dayjs";
import { DatePicker, DateView, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { SxProps, Theme } from "@mui/material";

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
  format?:string;
  sx?: SxProps<Theme>;
  shouldDisableDate? : (newDate: Dayjs ) => boolean;
}

const CustomisedDatePicker = (props: PropsTypes) => {
  const { label, value, setValue, maxDate, name, minDate, disabled = false, views, sx ,format, shouldDisableDate} = props;
  return (
    
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker"]}>
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
                className: "w-100",
                inputProps: {
                  readOnly: true,
                  onKeyDown: (e) => e.preventDefault(), // Disable arrow key navigation
                  onScroll: (e) => e.preventDefault(),
                },
              },
              inputAdornment: {
                sx: {
                  "& .MuiIconButton-root": {
                    border: 0,
                    padding: 0
                  }
                }
              }

          }}
          sx={{
            ...sx,
            minWidth: "unset !important",
            width: 1
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default CustomisedDatePicker;
