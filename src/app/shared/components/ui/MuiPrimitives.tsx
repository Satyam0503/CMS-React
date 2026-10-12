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

/** Shared password visibility control: icon-only, no outlined/boxed affordance. */
export const passwordVisibilityButtonSx = {
  width: 32,
  height: 32,
  p: 0.5,
  border: 0,
  borderRadius: "50%",
  color: "text.disabled",
  bgcolor: "transparent",
  transition: "color 160ms ease, transform 160ms ease",
  "& svg": { fontSize: 19, transition: "transform 180ms ease, opacity 160ms ease" },
  "&:hover": { bgcolor: "transparent", color: "primary.main", transform: "scale(1.08)" },
  "&:active": { transform: "scale(.92)" },
  "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 1 },
} as const;

const defaultOutlinedFieldSx = {
  "& .MuiOutlinedInput-root, &.MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(12px) saturate(160%)",
    WebkitBackdropFilter: "blur(12px) saturate(160%)",
    transition: "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(203, 213, 225, 0.75)",
      borderWidth: "1px",
    },
    "&:hover:not(.Mui-disabled)": {
      bgcolor: "rgba(255, 255, 255, 0.85)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(11, 92, 171, 0.45)",
      },
    },
    "&.Mui-focused": {
      bgcolor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(11, 92, 171, 0.14)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        borderWidth: "1.5px",
      },
    },
  },
  "& .MuiSelect-icon": {
    color: "#475569",
  },
} as const;

/** Central MUI primitives. Keep product-wide defaults here instead of per page. */
export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AppButton({ variant = "contained", disableElevation = true, ...props }, ref) {
    return <Button ref={ref} variant={variant} disableElevation={disableElevation} {...props} />;
  },
) as typeof Button;

export const Btn = AppButton;

export const AppTextField = ({ variant = "outlined", fullWidth = true, size = "medium", sx, ...props }: TextFieldProps) => (
  <TextField
    variant={variant}
    fullWidth={fullWidth}
    size={size}
    sx={[defaultOutlinedFieldSx, ...(Array.isArray(sx) ? sx : [sx])]}
    {...props}
  />
);

export const Txt = AppTextField;

export const AppSelect = <Value,>({ variant = "outlined", fullWidth = true, sx, ...props }: SelectProps<Value>) => (
  <Select<Value>
    variant={variant}
    fullWidth={fullWidth}
    sx={[defaultOutlinedFieldSx, ...(Array.isArray(sx) ? sx : [sx])]}
    {...props}
  />
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
