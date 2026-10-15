import {
  FormControl,
  FormLabel,
  InputBaseProps,
  OutlinedInputProps,
  SxProps,
  Theme,
} from "@mui/material";
import { useField } from "formik";
import { FC } from "react";
import { blockInvalidCharOnNumberField } from "../../../../utils/common";
import { useIntl } from "react-intl";
import { AppTextField } from "../ui";

export interface InputFieldProps {
  label: string;
  name: string;
  type: React.InputHTMLAttributes<unknown>['type'];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  size?: "small" | "medium";
  inputProps?: InputBaseProps["inputProps"];
  InputProps?: Partial<OutlinedInputProps>;
  InputLabelProps?: Record<string, any>;
  helperText?: string;
  labelVarient?: "notched" | "seperate";
  showErrorLabel?: boolean;
  sx?: SxProps<Theme>;
}

export const TextInput: FC<InputFieldProps> = ({
  label,
  inputProps,
  InputProps,
  InputLabelProps,
  helperText,
  labelVarient = "notched",
  showErrorLabel = true,
  size,
  ...props
}) => {
  const { formatMessage: i } = useIntl();
  const [fields, meta] = useField(props);
  const fieldError = meta.touched && meta.error ? i({ id: meta.error, defaultMessage: meta.error }) : "";
  const finalHelperText = showErrorLabel ? fieldError || helperText || "" : helperText || "";

  return (
    <FormControl fullWidth>
      {
        labelVarient === "seperate" &&
        <FormLabel required={Boolean(props.required)} sx={{ fontSize: 12, marginBlockEnd: .25 }}>{label} </FormLabel>
      }
      <AppTextField
        fullWidth
        label={labelVarient === "notched" ? label : ""}
        variant="outlined"
        error={Boolean(fieldError)}
        helperText={finalHelperText}
        size={size}
        InputLabelProps={InputLabelProps}
        onKeyDown={(e) => {
          if (props.type === "number") {
            blockInvalidCharOnNumberField(e)
          }
        }}
        slotProps={{
          htmlInput: inputProps,
          input: InputProps
        }}
        onWheel={(e) => {
          if (props.type === "number") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        {...fields}
        {...props}
      />
    </FormControl>
  );
};
