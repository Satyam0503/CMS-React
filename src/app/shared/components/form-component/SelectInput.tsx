import {
  FormControl,
  InputLabel,
} from "@mui/material";
import { useField } from "formik";
import { FC, ReactNode } from "react";
import { AppSelect } from "../ui";
// import { useIntl } from "react-intl";

interface PropsTypes {
  label: string;
  name: string;
  children: ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export const SelectInput: FC<PropsTypes> = ({ label, children, ...props }) => {
  const [field, meta] = useField(props);
  // const { formatMessage: i } = useIntl()

  return (
    <FormControl fullWidth>
      <InputLabel id="select-label" required={props.required}>{label}</InputLabel>
      <AppSelect
        fullWidth
        variant="outlined"
        labelId="select-label"
        label={label}
        error={meta.touched && Boolean(meta.error)}
        {...field}
        {...props}
        value={field.value ?? ""}
      >
        {children}
      </AppSelect>
      {/* {meta.touched && meta.error && (
        <FormHelperText
          sx={{
            fontSize: 10,
            color: 'error.main',
            marginInline: "8px",
            marginTop: "3px",
          }}
        >
          {i({ id: meta.error })}
        </FormHelperText>
      )} */}
    </FormControl>
  );
};
