import dayjs from "dayjs";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

type PayrollDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  clearable?: boolean;
};

/** Payroll date input adapter: keeps API values date-only while using the shared calendar UI. */
export function PayrollDateField({
  label, value, onChange, helperText, error = false, disabled = false,
  required = false, minDate, maxDate, clearable = !required,
}: PayrollDateFieldProps) {
  const selectedDate = value ? dayjs(value) : null;
  const parsedMin = minDate ? dayjs(minDate) : undefined;
  const parsedMax = maxDate ? dayjs(maxDate) : undefined;
  return (
    <CustomisedDatePicker
      label={label}
      value={selectedDate?.isValid() ? selectedDate : null}
      setValue={(nextDate) => onChange(nextDate?.isValid() ? nextDate.format("YYYY-MM-DD") : "")}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      clearable={clearable}
      format="DD MMM YYYY"
      minDate={parsedMin?.isValid() ? parsedMin : undefined}
      maxDate={parsedMax?.isValid() ? parsedMax : undefined}
    />
  );
}
