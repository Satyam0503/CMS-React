import { Button, Grid, Stack, useTheme } from "@mui/material";
import CustomisedButton from "./CustomisedButton";

const ButtonGroup = () => {
  const theme = useTheme();
  return (
    <Grid
      item
      xs={12}
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
      }}
    >
      <CustomisedButton variant="outlined" size="medium" label="Cancel" />
      <CustomisedButton variant="contained" size="medium" label="Save" />
    </Grid>
  );
};

export default ButtonGroup;
