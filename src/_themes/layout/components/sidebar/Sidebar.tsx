import { FC, useState } from "react";
import { Box, ButtonBase, Drawer, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { useAppStyle } from "../../../../app/modules/theme/useAppStyle";

type Props = {
  open: boolean;
  handleClose: () => void;
  isMiniSidebar: boolean;
  setMiniSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}


const Sidebar: FC<Props> = ({ open, handleClose, isMiniSidebar, setMiniSidebar }) => {
  const theme = useTheme();
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
      <Stack role="presentation" onClick={handleClose} sx={{ height: "100%", minHeight: 0, flexGrow: 1, p: 2, overflow: "hidden" }}>
        {/* Company logo strip — small, top-of-sidebar */}
        <SidebarMenuMain
          currentIndex={openIndex}
          handleToggle={handleToggle}
          isMiniSidebar={!isSmallScreen && isMiniSidebar}
        />

        {!isSmallScreen && (
          <Box className="sidebar-footer">
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
          </Box>
        )}
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
