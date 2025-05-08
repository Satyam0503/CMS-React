import { Grid, Tooltip } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";

import ChatDrawer from "./ChatDrawer";

import LightDarkMode from "./LightDarkMode";

const Navbar = () => {
  return (
    <Grid
      item
      display={"flex"}
      justifyContent={"flex-end"}
      alignItems={"center"}
      gap={{ xs: 0.8, sm: 2 }}
    >
      <LightDarkMode />
      <ChatDrawer />
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Grid>
  );
};

export { Navbar };
