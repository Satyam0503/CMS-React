import { KTIcon } from "../../../helpers";
import { useLayout } from "../../core";
import { useAppSelector } from "../../../../app/Redux/hooks";
import ChatDrawer from "../../../../app/modules/chats/ChatDrawer";
import HeaderUserMenu from "../../../partials/layout/portal-header-menus/HeaderUserMenu";
import HeaderNotificationMenu from "../../../partials/layout/portal-header-menus/HeaderNotificationsMenu";
import { Box, Grid, Stack } from "@mui/material";
import { SegmentOutlined } from "@mui/icons-material";
import { colors } from "../../../../app/modules/theme/MuiTheme";

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
      <HeaderNotificationMenu />
      <ChatDrawer />
      <HeaderUserMenu />

      {config.app?.header?.default?.menu?.display && (
        <Stack display={{ xs: "block", md: "none" }}>
          <Box id="kt_app_header_menu_toggle">
            <SegmentOutlined
              fontSize="large"
              sx={{ color: colors.alpha.neutral[400] }}
            />
          </Box>
        </Stack>
      )}
    </Grid>
  );
};

export { Navbar };
