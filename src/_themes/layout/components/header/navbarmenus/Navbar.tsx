import { Box, Grid, Stack } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";
import { Search } from "@mui/icons-material";
import { useLayout } from "../../../../../_themes/layout/core";

import ChatDrawer from "./ChatDrawer";
import { useAppSelector } from "../../../../../app/Redux/hooks";

const Navbar = () => {
  const { config } = useLayout();
  const profileImageUrl = useAppSelector((state) => state.user.profileImageUrl);
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
