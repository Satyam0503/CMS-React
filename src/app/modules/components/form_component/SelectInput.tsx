import {
  FormControl,
  FormHelperText,
  InputLabel,
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
      {/* <Typography variant="body1" id="select-label">
        {label}
      </Typography> */}
      <FormControl>
        <InputLabel id="select-label">{label}</InputLabel>
        <Select
          fullWidth
          variant="outlined"
          labelId="select-label"
          label={label}
          error={meta.touched && Boolean(meta.error)}
          {...field}
          {...props}
          // renderValue={value=>{
          //   if(!value){
          //     return <Typography variant="body2" sx={{color:colors.alpha.neutral[400], fontSize:"14px"}}>{label}</Typography>
          //   }
          //   return ;
          // }}
        >
          {children}
        </Select>
      </FormControl>
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
