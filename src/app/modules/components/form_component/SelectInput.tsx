import {
  FormHelperText,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useField } from "formik";
import { FC, ReactNode } from "react";

interface PropsTypes {
  label: string;
  name: string;
  children: ReactNode[];
}

export const SelectInput: FC<PropsTypes> = ({ label, children, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <Stack spacing={0.5}>
      <Typography variant="body1" id="select-label">
        {label}
      </Typography>
      <Select
        fullWidth
        variant="outlined"
        labelId="select-label"
        error={meta.touched && Boolean(meta.error)}
        {...field}
        {...props}
      >
        {children}
      </Select>
      <FormHelperText
        sx={{
          fontSize: "12px",
          color: "#d32f2f",
          marginInline: "8px !important",
          marginTop: "3px !important",
        }}
      >
        {meta.touched && meta.error && meta.error}
      </FormHelperText>
    </Stack>
  );
};
