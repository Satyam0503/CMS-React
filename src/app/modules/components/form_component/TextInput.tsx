import { TextField, Typography } from "@mui/material";
import { useField } from "formik";
import { FC } from "react";
interface PropsTypes {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}

export const TextInput: FC<PropsTypes> = ({ label, ...props }) => {
  const [fields, meta] = useField(props);  
  return (
    <>
      <Typography variant="body1" mb={.5}>{label}</Typography>
      <TextField
        fullWidth
        variant="outlined"
        error={meta.touched && Boolean(meta.error)}
        helperText={(meta.touched &&  meta.error) && meta.error}
        {...fields}
        {...props}
      />
    </>
  );
};
