import {
  FormControlLabel,
  FormGroup,
} from "@mui/material";

import { AppSwitch } from "./ui";
export default function CustomSwitchButton() {
  return (
    <FormGroup sx={{ marginLeft: 2 }}>
      <FormControlLabel control={<AppSwitch />} label="" />
    </FormGroup>
  );
}
