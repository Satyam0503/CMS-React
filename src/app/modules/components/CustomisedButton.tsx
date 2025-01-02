/** @format */

import { Button, Tooltip } from "@mui/material";
import React from "react";
import classNames from "classnames";

type Props = {
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  Icon?: React.JSX.Element;
  variant?: "outlined" | "contained" | "text";
  label?: string;
  tooltip?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  disabled?: any;
  permission?: any;
  style?: any;
  iconPosition?: "start" | "end";
};

const CustomisedButton = (props: Props) => {
  const {
    handleClick,
    variant,
    Icon,
    label,
    tooltip,
    className,
    size,
    disabled = false,
    permission = true,
    style = {},
    iconPosition = "end",
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
