import {
  Alert,
  AlertProps,
  Button,
  ButtonProps,
  Checkbox,
  CheckboxProps,
  IconButton,
  IconButtonProps,
  Radio,
  RadioProps,
  Select,
  SelectProps,
  Switch,
  SwitchProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { forwardRef } from "react";

/** Central MUI primitives. Keep product-wide defaults here instead of per page. */
export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AppButton({ variant = "contained", disableElevation = true, ...props }, ref) {
    return <Button ref={ref} variant={variant} disableElevation={disableElevation} {...props} />;
  },
) as typeof Button;

export const Btn = AppButton;

export const AppTextField = ({ variant = "outlined", fullWidth = true, size = "medium", ...props }: TextFieldProps) => (
  <TextField variant={variant} fullWidth={fullWidth} size={size} {...props} />
);

export const Txt = AppTextField;

export const AppSelect = <Value,>({ variant = "outlined", fullWidth = true, ...props }: SelectProps<Value>) => (
  <Select<Value> variant={variant} fullWidth={fullWidth} {...props} />
);

export const Sel = AppSelect;

export const AppCheckbox = ({ color = "primary", ...props }: CheckboxProps) => (
  <Checkbox color={color} {...props} />
);

export const AppRadio = ({ color = "primary", ...props }: RadioProps) => (
  <Radio color={color} {...props} />
);

export const AppSwitch = ({ color = "primary", ...props }: SwitchProps) => (
  <Switch color={color} {...props} />
);

export const Sw = AppSwitch;

/**
 * Tooltip and similar MUI components attach a ref to their direct child.
 * Forward it through this shared wrapper so it remains safe to use as a
 * Tooltip child throughout the application.
 */
export const AppIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function AppIconButton({ color = "inherit", ...props }, ref) {
    return <IconButton ref={ref} color={color} {...props} />;
  },
);

export const IconBtn = AppIconButton;

export const AppAlert = ({ severity = "info", variant = "standard", ...props }: AlertProps) => (
  <Alert severity={severity} variant={variant} {...props} />
);

export const Alrt = AppAlert;
