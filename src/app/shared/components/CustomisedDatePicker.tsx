/** @format */

import { Dayjs } from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
interface PropsTypes {
  value: Dayjs | null;
  setValue: (newDate: Dayjs | null) => void;
  label?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  name?: string;
  className?: string;
  disabled?: boolean;
}

const CustomisedDatePicker = (props: PropsTypes) => {
  const { label, value, setValue, maxDate, name, minDate, disabled = false } = props;
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
            slotProps={{
              textField: {
                inputProps: {
                  readOnly: true,
                  onKeyDown: (e) => e.preventDefault(), // Disable arrow key navigation
                  onScroll: (e) => e.preventDefault(),
                },
              },
            }}
            sx={{
              minWidth: {
                xl: "100% !important",
                sm: "100% !important",
              },
              "& .MuiIconButton-root": {
                border: 0,
                padding: 0,
              },
            }}
          />
        </DemoContainer>
      </LocalizationProvider>
    </>
  );
};

export default CustomisedDatePicker;
