import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import { ForumOutlined } from "@mui/icons-material";

import { Badge, IconButton, Tooltip } from "@mui/material";
import ChatMessenger from "../chats/ChatMessanger";
import { InnerChat } from "../chats/InnerChat";

export default function ChatDrawer() {
  const [open, setOpen] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState(null);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedChat(null); // Reset view when closing
    }
  };

  const DrawerList = (
    <Box
      sx={{
        width: { xs: "320px", sm: "400px", md: "480px" },
        p: 2,
        minHeight: "100vh",
      }}
      role="presentation"
      onClick={toggleDrawer(true)}
    >
      {selectedChat ? (
        <InnerChat
          isDrawer={true}
          contact={selectedChat}
          goBack={() => setSelectedChat(null)}
        />
      ) : (
        <ChatMessenger onChatSelect={(contact) => setSelectedChat(contact)} />
      )}
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
