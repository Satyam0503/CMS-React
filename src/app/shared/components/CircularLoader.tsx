import { Box, CircularProgress } from "@mui/material";
import { colors } from "../../modules/theme/MuiTheme";

const style = {
  height:"100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
export const CircularLoader = () => {
  return (
    <Box component={"div"} sx={style} className=" flex-grow-1">
      <CircularProgress size={50} thickness={5} sx={{color:colors.alpha.primary[500]}} />
    </Box>
  );
};
