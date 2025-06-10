import { Grid, Stack, Tooltip } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";

import ChatDrawer from "./ChatDrawer";

import LightDarkMode from "./LightDarkMode";

const Navbar = () => {
  return (
    <Stack
      direction="row"
      justifyContent={"flex-end"}
      alignItems={"center"}
      spacing={2}
    >
      <LightDarkMode />
      <ChatDrawer />
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Stack>
  );
};

export { Navbar };
