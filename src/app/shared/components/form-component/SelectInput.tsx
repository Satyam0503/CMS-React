import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import { useField } from "formik";
import { FC, ReactNode } from "react";

interface PropsTypes {
  label: string;
  name: string;
  children: ReactNode;
}

export const SelectInput: FC<PropsTypes> = ({ label, children, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <FormControl fullWidth>
      <InputLabel id="select-label">{label}</InputLabel>
      <Select
        fullWidth
        variant="outlined"
        labelId="select-label"
        label={label}
        error={meta.touched && Boolean(meta.error)}
        {...field}
        {...props}
      >
        {children}
      </Select>
      {meta.touched && meta.error && (
        <FormHelperText
          sx={{
            fontSize: "12px",
            color: "#d32f2f",
            marginInline: "8px !important",
            marginTop: "3px !important",
          }}
        >
          {meta.error}
        </FormHelperText>
      )}
    </FormControl>
  );
};
