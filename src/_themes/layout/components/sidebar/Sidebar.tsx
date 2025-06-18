import { FC, useState } from "react";
import { Avatar, Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { West } from "@mui/icons-material";

type Props = {
  open: boolean;
  handleClose: () => void;
  isMiniSidebar: boolean;
  setMiniSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: FC<Props> = ({ open, handleClose, isMiniSidebar, setMiniSidebar }) => {
  const theme = useTheme();
  const currentUser = useAppSelector((state) => state.user.userData);
  const profileUrl = useAppSelector((state) => state.user.userData?.profileImage);
  const companyLogo = useAppSelector((state => state.user.userData?.companyLogo));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Track the open item index

  const handleSideBarToggle = () => {
    setMiniSidebar(!isMiniSidebar);
    if (openIndex) {
      setOpenIndex(null);
    }
  }

  const handleToggle = (index: number | null) => {
    setOpenIndex(index);
  }

  return (
    <Drawer variant={isSmallScreen ? 'temporary' : 'permanent'} open={open} PaperProps={{
      sx: { backgroundColor: 'background.sidebar', backgroundImage: "none" },
      className: 'sidebar-paper',
    }}
      onClose={handleClose}
      className="sidebar"
      data-sidebar-mini={isSmallScreen ? "false" : isMiniSidebar ? "true" : "false"}
    >
      <Stack role="presentation" spacing={2} onClick={handleClose} sx={{ flexGrow: 1, p: 2, overflow: "hidden" }}>
        {
          !isSmallScreen &&
          <IconButton aria-label="menu toggle" size="large" className="sidebar-collapse-button" sx={{ backgroundColor: 'background.card' }}
            onClick={handleSideBarToggle}
            onMouseOver={(e) => e.stopPropagation()}
          >
            <West className="icon-fs-20" />
          </IconButton>
        }
        <Stack spacing={4} alignItems="center" >
          <Avatar
            variant="square"
            alt="Company Logo"
            src={companyLogo}
            className="company-logo"
            sx={{
              maxWidth: "200px",
              width: "100%",
              height: "60px",
              "& .MuiAvatar-img": {
                objectFit: "contain",
              }
            }}
          />
          <Box component="div" className="user-profile-wrapper">
            <Avatar
              alt=""
              src={profileUrl}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                aspectRatio: 1,
              }}
            />
          </Box>
          <Typography sx={{ color: 'common.white', textAlign: "center", textWrap: "balance" }} className="user-name">
            {`${currentUser?.firstName}  ${currentUser?.lastName}`}
          </Typography>
        </Stack>
        <SidebarMenuMain currentIndex={openIndex} handleToggle={handleToggle} />
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
