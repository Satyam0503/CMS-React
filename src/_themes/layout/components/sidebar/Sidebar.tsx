import { FC, useState } from "react";
import { Avatar, Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { ChevronLeft } from "@mui/icons-material";
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

  const fullName = `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim();
  const jobTitle = currentUser?.jobTitle ?? "";

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
          <IconButton aria-label="menu toggle" size="small" className="sidebar-collapse-button"
            onClick={handleSideBarToggle}
            onMouseOver={(e) => e.stopPropagation()}
          >
            <ChevronLeft className="fs-18" />
          </IconButton>
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
              width: "100%",
              maxWidth: 160,
              height: 36,
              "& .MuiAvatar-img": { objectFit: "contain", objectPosition: "left center" },
            }}
          />
        </Box>

        {/* Compact user block — avatar (left) + name + role pill */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          className="sidebar-user-block"
        >
          <Avatar
            alt={fullName}
            src={profileUrl || DEFAULT_USER_AVATAR}
            className="user-avatar"
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              border: "2px solid rgba(255, 255, 255, 0.18)",
            }}
          />
          <Stack
            direction="column"
            spacing={0.25}
            className="user-block-info"
            sx={{ minWidth: 0, flexGrow: 1 }}
          >
            <Typography
              className="user-name"
              sx={{
                color: "common.white",
                fontWeight: 600,
                fontSize: 15,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
              title={fullName}
            >
              {fullName}
            </Typography>
            {jobTitle && (
              <Typography
                className="user-jobtitle"
                sx={{
                  color: "rgba(255, 255, 255, 0.65)",
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
                title={jobTitle}
              >
                {jobTitle}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Box className="sidebar-divider" />

        <SidebarMenuMain currentIndex={openIndex} handleToggle={handleToggle} />
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
