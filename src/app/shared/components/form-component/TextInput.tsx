import {
  InputBaseProps,
  OutlinedInputProps,
  TextField,
} from "@mui/material";
import { useField } from "formik";
import { FC } from "react";
import { blockInvalidCharOnNumberField } from "../../../../utils/common";
import { useIntl } from "react-intl";

export interface InputFieldProps {
  label: string;
  name: string;
  type: React.InputHTMLAttributes<unknown>['type'];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  inputProps?: InputBaseProps["inputProps"];
  InputProps?: Partial<OutlinedInputProps>;
}

export const TextInput: FC<InputFieldProps> = ({ label, ...props }) => {
  const { formatMessage: i } = useIntl();
  const [fields, meta] = useField(props);
  return (
    <TextField
      fullWidth
      label={label}
      variant="outlined"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error && i({ id: meta.error, defaultMessage: " " })}
      {...fields}
      {...props}
      onKeyDown={(e) => {
        if (props.type === "number") {
          blockInvalidCharOnNumberField(e)
        }
      }}
      onWheel={(e) => {
        if (props.type === "number") {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
};
