import * as React from "react";
import { styled } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import shadows from "@mui/material/styles/shadows";
import { colors } from "../theme/MuiTheme";

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 36,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 0,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: colors.alpha.white[500],
      "& + .MuiSwitch-track": {
        backgroundColor: colors.alpha.primary[500],
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: colors.alpha.primary[500],
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: colors.alpha.white[500],
      border: "6px solid" + colors.alpha.white[500],
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: colors.alpha.neutral[500],
      ...theme.applyStyles("dark", {
        color: colors.alpha.neutral[500],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 19,
    height: 20,
    border: "1px solid " + colors.alpha.neutral[300],
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: colors.alpha.neutral[300],
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: colors.alpha.neutral[500],
    }),
  },
}));

export default function CustomSwitchButton() {
  return (
    <FormGroup>
      <FormControlLabel
        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
        label=""
      />
    </FormGroup>
  );
}
