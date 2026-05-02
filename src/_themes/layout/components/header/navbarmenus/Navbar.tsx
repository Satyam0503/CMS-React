import { Stack } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";
import LightDarkMode from "./LightDarkMode";
import { AppStylePicker } from "./AppStylePicker";

const Navbar = () => {
  return (
    <Stack className="flex-row gap-8 align-items-center">
      <Stack direction="row" spacing={2}>
        <AppStylePicker />
        <LightDarkMode />
        <HeaderNotificationMenu />
      </Stack>
      <HeaderUserMenu />
    </Stack>
  );
};

export { Navbar };
