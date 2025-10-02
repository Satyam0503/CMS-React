import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Chat, Close, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import React, { useState } from "react";
import { DEFAULT_USER_AVATAR } from "../../../../../utils/constant/Constant";

export const ChatMessenger = () => {
  const theme = useTheme();
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  }

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  }

  return (
    <>
      <Tooltip title={i({ id: "TOOLTIP.CHATS" })}>
        <IconButton className="chat-button" onClick={handleDrawerOpen}>
          <Chat />
        </IconButton>
      </Tooltip>
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose} anchor="right" hideBackdrop
        PaperProps={{
          className: isSmallScreen ? "w-100" : "w-auto"
        }}
        className="chat-container"
      >
        <Box role="presentation" className="w-100 chat-wrapper" >
          <Stack direction="row" className="p-4 justify-content-between align-items-center border-bottom">
            <Typography variant="h5">{i({ id: "CHAT.TITLE" })}</Typography>
            <IconButton className="border-0 p-0" onClick={handleDrawerClose}>
              <Close />
            </IconButton>
          </Stack >
          <Stack className="chat-box">
            <Typography variant="h6">{i({ id: "CHAT.ALLCHAT" })}</Typography>
            <Stack>
              {
                Array.of(1, 2, 3, 4, 5).map(item => (
                  <React.Fragment key={item}>
                    <Box className="chat-item hover-secondary">
                      <Stack direction="row" spacing={1}>
                        <Badge
                          badgeContent={2}
                          color="primary"
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                        >
                          <Avatar
                            src={DEFAULT_USER_AVATAR}
                            alt="User-Profile"
                            sx={{
                              width: 45,
                              height: 45
                            }}
                          />
                        </Badge>
                        <Stack className="flex-grow-1">
                          <Stack direction="row" className="justify-content-between gap-2">
                            <Typography variant="body1">Shweta Chamoli</Typography>
                            <Typography variant="subtitle2">12:00 Am</Typography>
                          </Stack>
                          <Typography variant="body2">
                            Hello Brain Cox, How r u ?
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    <Divider className="my-1" />
                  </React.Fragment>
                ))
              }
            </Stack >
          </Stack>
        </Box>
      </Drawer >
    </>
  );
}
