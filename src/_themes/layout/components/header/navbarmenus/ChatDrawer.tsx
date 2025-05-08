import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";

import {
  BuildCircle,
  ChatBubbleOutlineOutlined,
  Circle,
  ForumOutlined,
  ForumRounded,
  ForumTwoTone,
} from "@mui/icons-material";

import { Avatar, Badge, IconButton, Tooltip } from "@mui/material";
import ChatMessenger from "../chats/ChatMessanger";
import { InnerChat } from "../chats/InnerChat";
import { colors } from "../../../../../app/modules/theme/MuiTheme";

export default function ChatDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: { xs: "300px", md: "500px" }, p: 2 }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <ChatMessenger />
      <InnerChat />
    </Box>
  );

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Chat">
          <IconButton
            sx={{
              border: "none",
              "&:hover": { bgcolor: "inherit", border: "none" },
            }}
            onClick={toggleDrawer(true)}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Badge badgeContent={1} color="primary" className="animation-blink">
              <ForumOutlined fontSize="large" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
