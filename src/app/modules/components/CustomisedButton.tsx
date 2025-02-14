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
  iconPosition?: "start" | "end";
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
    style = { gap: ".5rem" },
    iconPosition = "end",
    type = "button",
    loading,
  } = props;

  {
    !loading && <span className="indicator-label">Submit</span>;
  }
  {
    loading && (
      <span className="indicator-progress" style={{ display: "block" }}>
        Please wait...{" "}
        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
      </span>
    );
  }
  return (
    <>
      {permission && (
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
          {loading ? <span className="spinner-loader"></span> : label}
          {iconPosition === "end" && Icon}
        </Button>
      )}
    </>
  );
};

export default CustomisedButton;
