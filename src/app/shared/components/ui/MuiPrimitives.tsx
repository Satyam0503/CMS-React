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

/** Central MUI primitives. Keep product-wide defaults here instead of per page. */
export const AppButton = (({ variant = "contained", disableElevation = true, ...props }: ButtonProps) => (
  <Button variant={variant} disableElevation={disableElevation} {...props} />
)) as typeof Button;

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

export const AppIconButton = ({ color = "inherit", ...props }: IconButtonProps) => (
  <IconButton color={color} {...props} />
);

export const IconBtn = AppIconButton;

export const AppAlert = ({ severity = "info", variant = "standard", ...props }: AlertProps) => (
  <Alert severity={severity} variant={variant} {...props} />
);

export const Alrt = AppAlert;
