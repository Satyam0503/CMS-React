import {  ErrorOutline } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

export const ResumeError = () => {
  return (
    <Box
      sx={{
        height: "300px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={1} alignItems={"center"}>
        <ErrorOutline color="error" sx={{ fontSize: "3rem" }} />
        <Typography variant="h6">Failed To Load Applicant Resume</Typography>
      </Stack>
    </Box>
  );
};
