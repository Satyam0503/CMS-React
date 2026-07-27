import {
  Tooltip,
} from "@mui/material";
import React from "react";

import { AppIconButton } from "./ui";
type Props = {
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onMouseClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  icon?: React.JSX.Element;
  tooltip?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  permission?: boolean;
  ariaLabel?: string;
  classNames?: string;
};

export const CustomIconButton = (props: Props) => {
  const {
    handleClick,
    onMouseClick,
    onMouseLeave,
    icon,
    tooltip,
    size,
    disabled = false,
    permission = true,
    ariaLabel = "button",
    classNames
  } = props;

  return (
    <>
      {permission && (
        <Tooltip title={tooltip} placement="top" arrow>
          <AppIconButton
            onClick={handleClick}
            disabled={disabled}
            size={size}
            type="button"
            aria-label={ariaLabel}
            onMouseEnter={onMouseClick}
            onMouseLeave={onMouseLeave}
            className={`${classNames} ratio-1x1`}
            sx={{
              width: "32px", height: "32px", bgcolor: "transparent",
              "& .MuiSvgIcon-root": {
                fontSize: 20,
              }
            }}
          >
            {icon}
          </AppIconButton>
        </Tooltip >
      )}
    </>
  );
};
