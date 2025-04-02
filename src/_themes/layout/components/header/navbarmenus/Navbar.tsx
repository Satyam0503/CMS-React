import { Grid } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";

import ChatDrawer from "./ChatDrawer";

const Navbar = () => {
  return (
    <Grid
      item
      display={"flex"}
      justifyContent={"flex-end"}
      alignItems={"center"}
      gap={1}
    >
      <ChatDrawer />
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Grid>
  );
};

export { Navbar };
  