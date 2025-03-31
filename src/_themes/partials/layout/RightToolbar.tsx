import { FC } from "react";

import { ToggleDashboard } from "./customize-dashboard/ToggleDashboard";
import { CustomDashboardDrawer } from "./customize-dashboard/CustomDashboardDrawer";
import { Stack } from "@mui/material";

const RightToolbar: FC = () => {
  return (
    <>
      <Stack className="engage-toolbar d-flex position-fixed px-5 fw-bolder zindex-2 top-50 end-0 transform-90 mt-20 gap-2">
        <ToggleDashboard />
      </Stack>
      <CustomDashboardDrawer />
    </>
  );
};

export { RightToolbar };
