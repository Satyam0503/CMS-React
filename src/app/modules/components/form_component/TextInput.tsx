import {
  InputBaseProps,
  OutlinedInputProps,
  TextField,
} from "@mui/material";
import { useField } from "formik";
import { FC } from "react";

interface PropsTypes {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  disabled?: boolean;
  multiline?: boolean;
  inputProps?: InputBaseProps["inputProps"];
  InputProps?: Partial<OutlinedInputProps>;
}

export const TextInput: FC<PropsTypes> = ({ label, ...props }) => {
  const [fields, meta] = useField(props);
  return (
      <TextField
        fullWidth
        label={label}
        variant="outlined"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error && meta.error}
        {...fields}
        {...props}
      />
  );
};
