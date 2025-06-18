import { IconButton, Tooltip } from "@mui/material";
import React, { CSSProperties } from "react";

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
  style?: CSSProperties;
};

export const CustomIconButton = (props: Props) => {
  const {
    handleClick,
    onMouseClick,
    onMouseLeave,
    icon,
    tooltip,
    size,
    style,
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
            style={style}
            onMouseEnter={onMouseClick}
            onMouseLeave={onMouseLeave}
            className="ratio-1x1"
            sx={{
              width: "32px", height: "32px", bgcolor: "transparent",
              "& .MuiSvgIcon-root": {
                fontSize: 20,
              }
            }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
