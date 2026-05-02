import { FC, useState } from "react";
import { Avatar, Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { West } from "@mui/icons-material";
import { DEFAULT_COMPANY_LOGO, DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { useAppStyle } from "../../../../app/modules/theme/useAppStyle";

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
  const { style: sidebarStyle } = useAppStyle();

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
    <Drawer variant={isSmallScreen ? 'temporary' : 'permanent'} open={open}
      slotProps={{
        paper: {
          sx: { backgroundColor: 'background.sidebar', backgroundImage: "none" },
          className: 'sidebar-paper',
        }
      }}
      onClose={handleClose}
      className="sidebar"
      data-sidebar-mini={isSmallScreen ? "false" : isMiniSidebar ? "true" : "false"}
      data-sidebar-style={sidebarStyle}
    >
      <Stack role="presentation" onClick={handleClose} sx={{ flexGrow: 1, p: 2, overflow: "hidden" }}>
        {
          !isSmallScreen &&
          <IconButton aria-label="menu toggle" size="large" className="sidebar-collapse-button" sx={{ backgroundColor: 'background.card' }}
            onClick={handleSideBarToggle}
            onMouseOver={(e) => e.stopPropagation()}
          >
            <West className="fs-20" />
          </IconButton>
        }
        <Stack className="align-items-center mt-4 mb-6" >
          <Avatar
            variant="square"
            alt="Company Logo"
            src={companyLogo || DEFAULT_COMPANY_LOGO}
            className="company-logo"
            sx={{
              backgroundColor: "transparent",
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
              src={profileUrl || DEFAULT_USER_AVATAR}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                aspectRatio: 1,
                backgroundColor: "secondary.main",
              }}
            />
          </Box>
          <Typography sx={{ color: 'common.white', textAlign: "center", textWrap: "balance" }} className="user-name mt-4">
            {`${currentUser?.firstName}  ${currentUser?.lastName}`}
          </Typography>
        </Stack>
        <SidebarMenuMain currentIndex={openIndex} handleToggle={handleToggle} />
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
