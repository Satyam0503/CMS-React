import { Box } from "@mui/material";
import { FC } from "react";
import { colors } from "../../../../app/modules/theme/MuiTheme";

const ToggleDashboard: FC = () => (
  <Box
    id="kt_help_toggle"
    className="engage-help-toggle btn btn-flex h-35px shadow-sm px-5"
    data-bs-dismiss="click"
    sx={{ bgcolor: colors.alpha.primary[100], px: 5 }}
  >
    Customize Dashboard
  </Box>
);

export { ToggleDashboard };
