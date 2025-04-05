import { Grid, Tooltip } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";

import ChatDrawer from "./ChatDrawer";
import RightDrawer from "../../../../../app/modules/dashboard/components/RightDrawer";

import LightDarkMode from "./LightDarkMode";

const Navbar = () => {
  return (
    <Grid
      item
      display={"flex"}
      justifyContent={"flex-end"}
      alignItems={"center"}
      gap={2}
    >
      <RightDrawer />
      <LightDarkMode />
      <ChatDrawer />
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Grid>
  );
};

export { Navbar };
