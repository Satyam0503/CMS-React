import { IconButton, Tooltip } from "@mui/material";
import React from "react";

type Props = {
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  icon?: React.JSX.Element;
  tooltip?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  permission?: boolean;
  ariaLabel?: string;
  sx?: {};
};

export const CustomIconButton = (props: Props) => {
  const {
    handleClick,
    icon,
    tooltip,
    size,
    sx,
    disabled = false,
    permission = true,
    ariaLabel = "button",
  } = props;

  return (
    <>
      {permission && (
        <Tooltip title={tooltip} placement="top" arrow>
          <IconButton
            onClick={handleClick}
            disabled={disabled}
            size={size}
            type="button"
            aria-label={ariaLabel}
            sx={{ width: "32px", height: "32px", bgcolor: "transparent" }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
