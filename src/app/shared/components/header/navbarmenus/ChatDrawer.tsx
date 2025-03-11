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

import { Avatar, IconButton, Tooltip } from "@mui/material";
import { colors } from "../../../../modules/theme/MuiTheme";
import ChatMessenger from "../../../../modules/chats/ChatMessanger";
import { InnerChat } from "../../../../modules/chats/InnerChat";


export default function ChatDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: { xs: "250px", md: "500px" }, p: 2 }}
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
              bgcolor: "inherit",
              border: "none",
              "&:hover": { bgcolor: "inherit", border: "none" },
            }}
            onClick={toggleDrawer(true)}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <ForumOutlined
              fontSize="large"
              sx={{ color: colors.alpha.neutral[400] }}
            />
            <Circle
              sx={{ width: "15px", color: colors.alpha.success[500] }}
              className=" position-absolute translate-middle  animation-blink"
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
