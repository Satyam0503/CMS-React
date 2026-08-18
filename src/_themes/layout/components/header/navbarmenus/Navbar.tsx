import { Stack } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";
import LightDarkMode from "./LightDarkMode";
import { AppStylePicker } from "./AppStylePicker";

const Navbar = () => {
  return (
    <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 2 }}>
      <Stack direction="row" spacing={{ xs: 0.5, sm: 2 }}>
        <Stack direction="row" spacing={2} sx={{ display: { xs: "none", md: "flex" } }}>
          <AppStylePicker />
          <LightDarkMode />
        </Stack>
        <HeaderNotificationMenu />
      </Stack>
      <HeaderUserMenu />
    </Stack>
  );
};

export { Navbar };
