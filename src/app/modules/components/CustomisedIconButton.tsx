import { IconButton, Tooltip } from "@mui/material";
import React from "react";

type Props = {
  type?: "submit" | "button" | "reset";
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  Icon?: React.JSX.Element;
  tooltip?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  permission?: boolean;
  style?: React.CSSProperties;
  variant?: "outlined" | "contained" | "text";
};

export const CustomisedIconButton = (props: Props) => {
  const {
    handleClick,
    variant = "contained",
    Icon,
    tooltip,
    className,
    size,
    disabled = false,
    permission = true,
    style = {},
    type = "button",
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
          <IconButton
            style={style}
            onClick={handleClick}
            disabled={disabled}
            size={size}
            className={className}
            type={type}
          >
            {Icon}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
