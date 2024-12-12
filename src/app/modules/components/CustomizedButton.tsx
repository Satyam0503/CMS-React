import { Button, Tooltip } from "@mui/material";
import React from "react";
import classNames from "classnames";

type Props = {
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  Icon?: React.JSX.Element;
  label?: string;
  tooltip?: string;
  className?: string;
  buttonSize?: string;
  disabled?: any;
  permission?: any;
  style?: any;
};

const CustomizedButton = (props: Props) => {
  const {
    handleClick,
    Icon,
    label,
    tooltip,
    className,
    buttonSize,
    disabled = false,
    permission = true,
    style = {},
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
      case "Cancel1":
        return "button-cancel1";
      default:
        return "button-default";
    }
  };

  return (
    <>
      {permission && (
        <Tooltip title={tooltip} placement="top" arrow>
          <Button
            style={style}
            className={classNames(
              className ? className : handleButtonSizeclasses(buttonSize)
            )}
            onClick={handleClick}
            disabled={disabled}
          >
            {Icon}
            {label}
          </Button>
        </Tooltip>
      )}
    </>
  );
};

export default CustomizedButton;

// CustomisedButton.propType = {
//   handleClick: PropTypes.func,
//   Icon: PropTypes.element,
//   className: PropTypes.string,
//   label: PropTypes.string,
//   tooltip: PropTypes.string,
//   buttonSize: PropTypes.instanceOf(classNames),
//   permission: PropTypes.bool,
//   disabled: PropTypes.bool,
//   style: PropTypes.instanceOf(Object),
// };
