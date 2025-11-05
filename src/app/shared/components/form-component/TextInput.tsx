import {
  FormControl,
  FormLabel,
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
  labelVarient?: "notched" | "seperate",
  showErrorLabel?: boolean,
}

export const TextInput: FC<InputFieldProps> = ({ label, inputProps, InputProps, labelVarient = "notched", showErrorLabel = true, ...props }) => {
  const { formatMessage: i } = useIntl();
  const [fields, meta] = useField(props);
  return (
    <FormControl fullWidth>
      {
        labelVarient === "seperate" &&
        <FormLabel required sx={{ fontSize: 12, marginBlockEnd: .25 }}>{label} </FormLabel>
      }
      <TextField
        fullWidth
        label={labelVarient === "notched" ? label : ""}
        variant="outlined"
        error={meta.touched && Boolean(meta.error)}
        helperText={showErrorLabel ? meta.touched && meta.error && i({ id: meta.error, defaultMessage: " " }) : ""}
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
