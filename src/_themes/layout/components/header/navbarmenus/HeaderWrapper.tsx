import {
  Avatar,
  Box,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useState } from "react";
import { Navbar } from "./Navbar";
import { Close, MenuOutlined, Search } from "@mui/icons-material";

import { EmployeeSearchInput } from "./EmployeeSearchInput";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { DEFAULT_COMPANY_LOGO } from "../../../../../utils/constant/Constant";

import { AppIconButton } from "../../../../../app/shared/components/ui";
type Props = {
  openSideBar: () => void;
  sidebarState: "mobile" | "collapsed" | "expanded";
};

export const HeaderWrapper: FC<Props> = ({ openSideBar, sidebarState }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isCompactScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
        width: { xs: "100%", md: "calc(100% - var(--sidebar-current-width))" },
        ml: { xs: 0, md: "var(--sidebar-current-width)" },
        transition: "width var(--sidebar-transition), margin-left var(--sidebar-transition)",
        height: "var(--app-header-height)",
        minHeight: "var(--app-header-height)",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 1, sm: 2.5, md: 3.5 },
        gap: { xs: 0.5, sm: 1.25 },
        flexShrink: 0,
      }}
      data-sidebar-state={sidebarState}
      className="app-header flex-row align-items-center justify-content-between position-relative z-3"
    >
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.25 }} sx={{ minWidth: 0, flex: "1 1 auto" }}>
        {isSmallScreen && (
          <AppIconButton
            aria-label="Open navigation menu"
            sx={{
              border: 0,
              width: 38,
              minWidth: 38,
              height: 38,
              p: 0.75,
              borderRadius: 2,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "primary.main" },
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
            }}
            onClick={openSideBar}
          >
            <MenuOutlined sx={{ fontSize: 22 }} />
          </AppIconButton>
        )}
        {!isSmallScreen ? (
          <EmployeeSearchInput sx={{ width: { md: 360, lg: 460 } }} />
        ) : (
          <Avatar
            variant="square"
            alt="Company Logo"
            src={companyLogo || DEFAULT_COMPANY_LOGO}
            className="header-company-logo"
            sx={{
              backgroundColor: "transparent",
              width: "auto",
              minWidth: 0,
              maxWidth: { xs: 78, sm: 140, md: 160 },
              height: { xs: 32, sm: 36 },
              "& .MuiAvatar-img": {
                objectFit: "contain",
                objectPosition: "left center",
              },
            }}
          />
        )}
      </Stack>
      <Stack direction="row" alignItems="center" sx={{ flex: "0 0 auto", gap: { xs: 0.25, sm: 0.75, md: 1.5 } }}>
        {isCompactScreen ? (
          <AppIconButton
            aria-label="Search employees"
            sx={{
              border: 0,
              width: 36,
              minWidth: 36,
              height: 36,
              p: 0.5,
              borderRadius: 2,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "primary.main" },
            }}
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search sx={{ fontSize: 20 }} />
          </AppIconButton>
        ) : null}
        <Navbar />
      </Stack>
      {isCompactScreen && isMobileSearchOpen && (
        <Box
          sx={{
            position: "absolute",
            inset: 6,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 0.5,
            bgcolor: "background.header",
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 3,
          }}
        >
          <EmployeeSearchInput
            autoFocus
            sx={{
              minWidth: 0,
              width: "100%",
              flex: 1,
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: 2,
                bgcolor: "background.default",
              },
            }}
          />
          <AppIconButton
            aria-label="Close employee search"
            sx={{ border: 0, width: 36, height: 36, flex: "0 0 auto", borderRadius: 2 }}
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <Close sx={{ fontSize: 20 }} />
          </AppIconButton>
        </Box>
      )}
    </Stack>
  );
};
