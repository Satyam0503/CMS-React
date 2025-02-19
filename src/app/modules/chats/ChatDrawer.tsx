import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Message } from "@mui/icons-material";
import { KTIcon } from "../../../_themes/helpers";
import ChatMessenger from "./ChatMessanger";
import { InnerChat } from "./InnerChat";

export default function ChatDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: { xs: "250px", md: "500px" } }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <ChatMessenger />
      <InnerChat />
    </Box>
  );

  return (
    <>
      <Button
        variant="text"
        sx={{ bgcolor: "inherit" }}
        onClick={toggleDrawer(true)}
      >
        <KTIcon iconName="message-text-2" className="fs-2 " />
        <span className="bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink" />
      </Button>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
