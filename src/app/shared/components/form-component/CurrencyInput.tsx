import { FormControl, FormLabel, InputAdornment, InputBaseProps, OutlinedInputProps, SxProps, Theme } from "@mui/material";
import { ChangeEvent, FC } from "react";
import { useField } from "formik";
import { useIntl } from "react-intl";
import { AppTextField } from "../ui";
import { isValidCurrencyInput } from "../../../../utils/currencyInput";

interface CurrencyInputProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  valueUnit?: string;
  currencySymbol?: string;
  labelVarient?: "notched" | "seperate";
  showErrorLabel?: boolean;
  inputProps?: InputBaseProps["inputProps"];
  InputProps?: Partial<OutlinedInputProps>;
  sx?: SxProps<Theme>;
}

// Salary values remain unformatted while editing so Formik submits the same
// numeric string it previously received from the native number input.
export const CurrencyInput: FC<CurrencyInputProps> = ({
  label,
  name,
  inputProps,
  InputProps,
  helperText,
  valueUnit,
  currencySymbol = "₹",
  labelVarient = "notched",
  showErrorLabel = true,
  ...props
}) => {
  const { formatMessage: i } = useIntl();
  const [field, meta, helpers] = useField<string | number | null>(name);
  const fieldError = meta.touched && meta.error ? i({ id: meta.error, defaultMessage: meta.error }) : "";
  const finalHelperText = showErrorLabel ? fieldError || helperText || "" : helperText || "";

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (isValidCurrencyInput(value)) {
      helpers.setValue(value);
    }
  };

  return (
    <FormControl fullWidth>
      {labelVarient === "seperate" && (
        <FormLabel required={props.required} sx={{ fontSize: 12, marginBlockEnd: 0.25 }}>
          {label}
        </FormLabel>
      )}
      <AppTextField
        {...props}
        fullWidth
        name={name}
        label={labelVarient === "notched" ? label : ""}
        type="text"
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        inputMode="decimal"
        autoComplete="off"
        variant="outlined"
        error={Boolean(fieldError)}
        helperText={finalHelperText}
        slotProps={{
          htmlInput: {
            ...inputProps,
            inputMode: "decimal",
            pattern: "-?[0-9]*[.]?[0-9]*",
          },
          input: {
            ...InputProps,
            startAdornment: (currencySymbol && valueUnit !== "%") ? (
              <>
                <InputAdornment position="start" sx={{ mr: 0.25 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>{currencySymbol}</span>
                </InputAdornment>
                {InputProps?.startAdornment}
              </>
            ) : InputProps?.startAdornment,
            endAdornment: valueUnit ? (
              <>
                {InputProps?.endAdornment}
                <InputAdornment position="end">{valueUnit}</InputAdornment>
              </>
            ) : InputProps?.endAdornment,
          },
        }}
      />
    </FormControl>
  );
};
