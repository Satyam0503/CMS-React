import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Grid, Menu, Stack, useMediaQuery, useTheme } from "@mui/material";
import { Edit, MenuOutlined, RecordVoiceOver } from "@mui/icons-material";
import { useState } from "react";

export function HeaderWrapper() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Grid
      item
      className="app-header p-3"
      position={"sticky"}
      top={0}
      bgcolor={"#fcfcfc"}
      zIndex={3}
    >
      <Grid item display={"flex"} alignItems={"center"} px={1}>
        <Grid
          item
          display={{ xs: "block", md: "none" }}
          id="kt_app_sidebar_mobile_toggle"
        >
          <MenuOutlined fontSize="large" onClick={toggleDrawer} />
        </Grid>

        <Grid
          item
          display={"flex"}
          flexDirection={{ xs: "row-reverse", md: "row" }}
          justifyContent={"space-between"}
          flexGrow={1}
          alignItems={"center"}
          gap={2}
        >
          <Stack display={{ xs: "none", md: "block" }}>
            <Header />
          </Stack>
          <Stack sx={{ paddingRight: 1 }}>
            <Navbar />
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
