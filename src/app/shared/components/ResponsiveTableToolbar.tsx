import { Box, Stack } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  search: ReactNode;
  actions: ReactNode;
};

/**
 * Keeps table searches on the left and row actions on the far edge. On small
 * screens the search takes a full row and the actions remain easy to reach.
 */
export const ResponsiveTableToolbar = ({ search, actions }: Props) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
      flexWrap: "wrap",
      p: { xs: 1, sm: 1.5 },
      mb: 1.75,
      borderRadius: 2.5,
      bgcolor: "action.hover",
    }}
  >
    <Box sx={{ flex: "1 1 260px", minWidth: 0, maxWidth: { xs: "100%", sm: "min(100%, 420px)" } }}>
      {search}
    </Box>
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        flex: "0 0 auto",
        ml: { xs: "auto", sm: 1 },
        justifyContent: "flex-end",
      }}
    >
      {actions}
    </Stack>
  </Box>
);
