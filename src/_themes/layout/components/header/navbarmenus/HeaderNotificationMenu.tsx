import * as React from "react";
import Menu from "@mui/material/Menu";

import Typography from "@mui/material/Typography";

import {
  Badge,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tooltip,
} from "@mui/material";
import { Close, NotificationsOutlined, Translate } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NoticeModel } from "../../../../../app/modules/noticeboard/models";

export default function HeaderNotificationMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationList, setNotificationList] = React.useState<NoticeModel[]>([])
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const intl = useIntl();
  const connection = Connector.getInstance().getConnetion();

  React.useEffect(() => {
    if (connection) {
      connection.on("noticeNotify", (notice: NoticeModel) => {
        setNotificationList([...notificationList, notice]);
      })
    }
  }, [])
  console.log(notificationList);

  return (
    <>
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

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            sx: { width: 300 }
          }
        }}
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
            {
              notificationList.map(notification => (
                <MenuItem className="px-2">
                  <ListItemIcon>
                    <Translate />
                  </ListItemIcon>
                  <ListItemText>
                    {notification.title}
                  </ListItemText>
                  {notification.target}
                </MenuItem>
              ))
            }
          </MenuList>
        </Stack>
      </Menu>
    </>
  );
}
