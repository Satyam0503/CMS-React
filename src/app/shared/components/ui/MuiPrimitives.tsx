import {
  Alert,
  AlertProps,
  Button,
  ButtonProps,
  Checkbox,
  CheckboxProps,
  Switch,
  SwitchProps,
  TextField,
  TextFieldProps,
} from "@mui/material";

/** Central MUI primitives. Keep product-wide defaults here instead of per page. */
export const AppButton = ({ variant = "contained", disableElevation = true, ...props }: ButtonProps) => (
  <Button variant={variant} disableElevation={disableElevation} {...props} />
);

export const AppTextField = ({ variant = "outlined", fullWidth = true, size = "medium", ...props }: TextFieldProps) => (
  <TextField variant={variant} fullWidth={fullWidth} size={size} {...props} />
);

export const AppCheckbox = ({ color = "primary", ...props }: CheckboxProps) => (
  <Checkbox color={color} {...props} />
);

export const AppSwitch = ({ color = "primary", ...props }: SwitchProps) => (
  <Switch color={color} {...props} />
);

export const AppAlert = ({ severity = "info", variant = "standard", ...props }: AlertProps) => (
  <Alert severity={severity} variant={variant} {...props} />
);
