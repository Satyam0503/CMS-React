/** @format */

import dayjs from "dayjs";
import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

const date = new Date();
const currentDate = date.getDate();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;

const CustomisedDatePicker = (props:any) => {
  const { label, value, setValue, dependentValue, setPage, className } = props;
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            label={label}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setPage(1);
            }}
            className={`text-dark ${className}`}
            shouldDisableDate={(date) =>
              label === "From Date"
                ? dayjs(date).isSame(dayjs(dependentValue)) ||
                  dayjs(date).isAfter(dayjs(dependentValue))
                : dayjs(date).isSame(dayjs(dependentValue)) ||
                  dayjs(date).isBefore(dayjs(dependentValue)) ||
                  dayjs(date).isAfter(
                    dayjs(`${currentYear}-${currentMonth}-${currentDate}`)
                  )
            }
            slotProps={{
              textField: {
                inputProps: {
                  readOnly: true,
                  onKeyDown: (e) => e.preventDefault(), // Disable arrow key navigation
                  onWheel: (e) => e.preventDefault(), // Disable scrolling
                  onScroll: (e) => e.preventDefault(),
                },
              },
            }}
            sx={{ minWidth: { xl: "100% !important", sm: "100% !important" } }}
          />
        </DemoContainer>
      </LocalizationProvider>
    </>
  );
};

export default CustomisedDatePicker;
