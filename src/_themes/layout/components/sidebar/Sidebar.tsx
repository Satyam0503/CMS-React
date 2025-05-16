import { FC, useEffect, useRef, useState } from "react";
import { Avatar, Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { Link } from "react-router-dom";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { East, West } from "@mui/icons-material";

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
      sx: { backgroundColor: "background.sidebar" },
      className: 'sidebar-paper',
    }}
      onClose={handleClose}
      className="sidebar"
      data-sidebar-mini={isSmallScreen ? "false" : isMiniSidebar ? "true" : "false"}
    >
      {/* <Box sx={{ width: 250 }} role="presentation" onClick={handleClose}> */}
      {
        !isSmallScreen &&
        <IconButton aria-label="menu toggle" size="large" className="sidebar-collapse-button" sx={{ backgroundColor: 'background.card' }}
          onClick={handleSideBarToggle}
          onMouseOver={(e) => e.stopPropagation()}
        >
          <West />
        </IconButton>
      }
      <Stack sx={{ p: 2 }} spacing={2} alignItems="center" width="100%">
        <Link to="/" className="company-logo-wrapper">
          <Avatar
            alt="Company Logo"
            src={companyLogo}
            sx={{
              width: "100%",
              height: "100%"
            }}
          />
        </Link>
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
      {/* </Box> */}
    </Drawer >
  );
};

export { Sidebar };
