import {
  InputBaseProps,
  OutlinedInputProps,
  TextField,
} from "@mui/material";
import { useField } from "formik";
import { FC } from "react";
import { blockInvalidCharOnNumberField } from "../../../../utils/common";

interface PropsTypes {
  label: string;
  name: string;
  type: React.InputHTMLAttributes<unknown>['type'];
  placeholder?: string;
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
        onKeyDown={(e)=>{
          blockInvalidCharOnNumberField(e)
        }}
        onWheel={(e)=>{
          if(props.type === "number"){
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
  );
};
