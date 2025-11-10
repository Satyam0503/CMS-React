import { Button, Tooltip } from "@mui/material";
import React from "react";

type Props = {
  type?: "submit" | "button" | "reset";
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  Icon?: React.JSX.Element;
  variant?: "outlined" | "contained" | "text";
  label?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  permission?: boolean;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
};

const CustomisedButton = (props: Props) => {
  const {
    handleClick,
    variant = "contained",
    Icon,
    label,
    className,
    size,
    disabled = false,
    permission = true,
    type = "button",
    loading,
    color = "primary"
  } = props;

  return (
    <>
      {permission && (
        <Button
          color={color}
          variant={variant}
          onClick={handleClick}
          disabled={disabled}
          size={size}
          className={className}
          type={type}
          sx={{
            gap: .5,
            lineHeight: 1.5,
            alignItems: "center",
            "& .MuiSvgIcon-root": {
              fontSize: 16
            }
          }}
        >
          {
            loading ? <span className="loader" /> :
              <>
                {label}
                {Icon}
              </>
          }
        </Button >
      )}
    </>
  );
};

export default CustomisedButton;
