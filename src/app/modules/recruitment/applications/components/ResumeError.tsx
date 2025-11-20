import { ErrorOutline } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";

export const ResumeError = () => {
  const { formatMessage: i } = useIntl();
  return (
    <Box
      sx={{
        height: "300px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={1} sx={{
        alignItems: "center"
      }}>
        <ErrorOutline color="error" sx={{ fontSize: "3rem" }} />
        <Typography variant="h6">{i({ id: "ERROR.RESUME_LOAD_FAILED" })}</Typography>
      </Stack>
    </Box>
  );
};
