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
  style?: React.CSSProperties;
  loading?: boolean;
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
  } = props;

  return (
    <>
      {permission && (
        <Button
          variant={variant}
          onClick={handleClick}
          disabled={disabled}
          size={size}
          className={className}
          type={type}
          sx={{ gap: 1 }}
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
