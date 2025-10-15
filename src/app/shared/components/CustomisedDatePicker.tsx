/** @format */

import { Dayjs } from "dayjs";
import { DatePicker, DateView, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { SxProps, Theme } from "@mui/material";
import { Download } from "@mui/icons-material";
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
}

const CustomisedDatePicker = (props: PropsTypes) => {
  const { label, value, setValue, maxDate, name, minDate, disabled = false, views, sx ,format} = props;
  return (
    <>
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
            sx={sx}
          />
        </DemoContainer>
      </LocalizationProvider>
    </>
  );
};

export default CustomisedDatePicker;
