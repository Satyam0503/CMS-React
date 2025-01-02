import { Button, Tooltip } from "@mui/material";
import React from "react";

type Props = {
 type?:"submit" | "button" | "reset";
 handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
 Icon?: React.JSX.Element;
 variant?: "outlined" | "contained" | "text";
 label?: string;
 tooltip?: string;
 className?: string;
 size?: "small" | "medium" | "large";
 disabled?: boolean;
 permission?: boolean;
 style?: React.CSSProperties;
 iconPosition?: "start" | "end";
};

const CustomisedButton = (props: Props) => {
 const {
  handleClick,
  variant="contained",
  Icon,
  label,
  tooltip,
  className,
  size,
  disabled = false,
  permission = true,
  style = {},
  iconPosition = "end",
  type="button",
 } = props;

 const handleButtonSizeclasses = (buttonSize?: string) => {
  switch (buttonSize) {
   case "Large":
    return "button-large";
   case "Medium":
    return "button-medium";
   case "Small":
    return "button-small";
   case "Cancel":
    return "button-cancel";
   default:
    return "button-default";
  }
 };

 return (
  <>
   {permission && (
    <Tooltip title={tooltip} placement="top" arrow>
     <Button
      variant={variant}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      size={size}
      className={className}
      type={type}
     >
      {iconPosition === "start" && Icon}
      {label}
      {iconPosition === "end" && Icon}
     </Button>
    </Tooltip>
   )}
  </>
 );
};

export default CustomisedButton;