import * as React from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";

import Typography from "@mui/material/Typography";

import { Divider, IconButton, Link, MenuList, Stack } from "@mui/material";
import {
  Message,
  MessageOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";

import { useIntl } from "react-intl";
import { useAppSelector } from "../../../../Redux/hooks";
import { useLogout } from "../../../auth";
import { colors } from "../../../theme/MuiTheme";

export default function HeaderNotificationMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const logout = useLogout();
  const currentUser = useAppSelector((state) => state.user.userData);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const profileImageUrl = useAppSelector((state) => state.user.profileImageUrl);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const intl = useIntl();
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <IconButton
          sx={{
            bgcolor: "inherit",
            border: "none",
            "&:hover": {
              bgcolor: "inherit",
              border: "none",
            },
          }}
          onClick={handleClick}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
        >
          <NotificationsOutlined
            sx={{ color: colors.alpha.neutral[400] }}
            fontSize="large"
          />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
      >
        <Stack>
          <Stack>
            <Stack
              direction={"row"}
              alignItems={"baseline"}
              gap={1}
              sx={{
                display: "flex",
                borderRadius: ".5rem",
                bgcolor: colors.alpha.neutral[100],
              }}
            >
              <Typography variant="h5" p={2}>
                <MessageOutlined /> Notifications
              </Typography>
              <Box component={"span"} sx={{ paddingRight: 1 }}>
                24 reports
              </Box>
            </Stack>
          </Stack>

          <Divider />
          <MenuList>
            <Stack>
              <Link href="/userdashboard">
                <Typography> Birthday Today</Typography>
              </Link>
              <Typography variant="body2">
                One of your collegue has birthday today
              </Typography>
            </Stack>
          </MenuList>
          <Divider />
          <MenuList>
            <Stack>
              <Link href="/noticeboard">
                <Typography> Notice Board </Typography>
              </Link>
              <Typography variant="body2">
                Hey, It could be an important message
              </Typography>
            </Stack>
          </MenuList>
          <Divider />

          <MenuList onClick={handleClose}>
            <Link href="/userdashboard">
              <Typography> Birthday Today</Typography>
            </Link>
            <Typography variant="body2">
              One of your collegue has birthday today
            </Typography>
          </MenuList>
          <Divider />

          <MenuList>
            <Link href="/myprofile">
              <Typography variant="body1">
                Unread message in Leave Tracker
              </Typography>
            </Link>
            <Typography variant="body2">
              Status of your leave is changed
            </Typography>
          </MenuList>
          <Divider />
          <MenuList>
            <Link href="/myprofile">
              <Typography variant="body1">Account setting</Typography>
            </Link>
            <Typography variant="body2">
              Password of portal has been changed
            </Typography>
          </MenuList>
        </Stack>
      </Menu>
    </>
  );
}
