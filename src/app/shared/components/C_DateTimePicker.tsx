import { DateTimePicker, DateTimePickerProps, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

type Props = Omit<DateTimePickerProps<Dayjs>, "value" | "onChange"> & { value: Dayjs | null; onChange: (value: Dayjs | null) => void };

const CustomisedDateTimePicker = ({ value, onChange, slotProps, ...props }: Props) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DateTimePicker
      {...props}
      value={value}
      onChange={onChange}
      slotProps={{
        ...slotProps,
        textField: { fullWidth: true, size: "small", ...(slotProps?.textField ?? {}) },
        openPickerButton: { sx: { border: 0, boxShadow: "none", borderRadius: 1.5, p: .75, "&:hover": { bgcolor: "action.hover" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 1 } } },
      }}
    />
  </LocalizationProvider>
);

export default CustomisedDateTimePicker;

