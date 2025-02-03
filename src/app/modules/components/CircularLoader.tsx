import { Box, CircularProgress } from "@mui/material";
const style = {
  height: "calc(100vh - 80px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
export const CircularLoader = () => {
  return (
    <Box component={"div"} sx={style}>
      <CircularProgress size={50} thickness={5} />
    </Box>
  );
};
