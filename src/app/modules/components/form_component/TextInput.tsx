import {
  FormControl,
  InputBaseProps,
  InputLabel,
  OutlinedInputProps,
  Stack,
  TextField,
  Typography,
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
    <Stack spacing={0.5}>
      {/* <Typography variant="body1">{label}</Typography> */}
      {/* <InputLabel>{label}</InputLabel> */}
      <TextField
        fullWidth
        label={label}
        variant="outlined"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error && meta.error}
        {...fields}
        {...props}
      />
    </Stack>
  );
};
