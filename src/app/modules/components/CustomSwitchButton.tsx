import { FormControlLabel, FormGroup, Switch } from "@mui/material";

export default function CustomSwitchButton() {
  return (
    <FormGroup sx={{ marginLeft: 2 }}>
      <FormControlLabel control={<Switch />} label="" />
    </FormGroup>
  );
}
