import * as React from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";

import Typography from "@mui/material/Typography";

import {
  Badge,
  Divider,
  IconButton,
  Link,
  MenuList,
  Stack,
  Tooltip,
} from "@mui/material";
import { Close, NotificationsOutlined } from "@mui/icons-material";

import { useIntl } from "react-intl";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { useLogout } from "../../../../../app/modules/auth";
import { colors } from "../../../../../app/modules/theme/MuiTheme";

export default function HeaderNotificationMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const intl = useIntl();
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Notifications" placement="bottom">
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
            <Badge badgeContent={4} color="primary">
              <NotificationsOutlined fontSize="large" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
      >
        <Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Stack direction={"row"} alignItems={"center"}>
              <Typography variant="h6" px={1}>
                Notifications
              </Typography>
              <Badge
                color="secondary"
                overlap="circular"
                badgeContent="1"
                sx={{ pl: 2 }}
              />
            </Stack>
            <Stack>
              <Close />
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
