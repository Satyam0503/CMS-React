import { FC, useState } from "react";
import { Avatar, Box, ButtonBase, Drawer, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { DEFAULT_COMPANY_LOGO } from "../../../../utils/constant/Constant";
import { useAppStyle } from "../../../../app/modules/theme/useAppStyle";

type Props = {
  open: boolean;
  handleClose: () => void;
  isMiniSidebar: boolean;
  setMiniSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}


const Sidebar: FC<Props> = ({ open, handleClose, isMiniSidebar, setMiniSidebar }) => {
  const theme = useTheme();
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
          <Tooltip title={isMiniSidebar ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
            <ButtonBase
              aria-label={isMiniSidebar ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isMiniSidebar}
              className="sidebar-edge-toggle"
              onClick={(event) => {
                event.stopPropagation();
                handleSideBarToggle();
              }}
            >
              <Box component="span" className="sidebar-edge-toggle-icon">
                <KeyboardDoubleArrowLeft />
              </Box>
            </ButtonBase>
          </Tooltip>
        }

        {/* Company logo strip — small, top-of-sidebar */}
        <Box className="sidebar-brand">
          <Avatar
            variant="square"
            alt="Company Logo"
            src={companyLogo || DEFAULT_COMPANY_LOGO}
            className="company-logo"
            sx={{
              backgroundColor: "transparent",
              width: !isSmallScreen && isMiniSidebar ? 36 : "100%",
              maxWidth: !isSmallScreen && isMiniSidebar ? 36 : 160,
              height: 36,
              "& .MuiAvatar-img": {
                objectFit: "contain",
                objectPosition: !isSmallScreen && isMiniSidebar ? "center" : "left center",
              },
            }}
          />
        </Box>

        <Box className="sidebar-divider" />

        <SidebarMenuMain
          currentIndex={openIndex}
          handleToggle={handleToggle}
          isMiniSidebar={!isSmallScreen && isMiniSidebar}
        />
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
