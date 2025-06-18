import { Stack } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";
import ChatDrawer from "./ChatDrawer";
import LightDarkMode from "./LightDarkMode";

const Navbar = () => {
  return (
    <Stack className="flex-row gap-4 align-items-center">
      <LightDarkMode />
      <ChatDrawer />
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Stack>
  );
};

export { Navbar };
