import { CircularProgress } from "@mui/material";
import React from "react";
import { AppButton } from "./ui";

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
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
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
    loading = false,
    color = "primary",
  } = props;

  return (
    <>
      {permission && (
        <AppButton
          color={color}
          variant={variant}
          onClick={handleClick}
          disabled={disabled}
          size={size}
          className={className}
          type={type}
          loading={loading}
          endIcon={Icon}
          loadingIndicator={
            <CircularProgress
              sx={{ color: "common.white" }}
              size={20}
              thickness={5}
            />
          }
        >
          {label}
        </AppButton>
      )}
    </>
  );
};

export default CustomisedButton;
