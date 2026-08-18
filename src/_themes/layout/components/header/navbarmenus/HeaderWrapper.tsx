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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const isCompactScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
        height: "var(--app-header-height)",
        minHeight: "var(--app-header-height)",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 1, sm: 3, md: 4 },
        gap: { xs: 0.5, sm: 1 },
      }}
      data-sidebar-state={sidebarState}
      className="app-header flex-row align-items-center justify-content-between position-relative z-3"
    >
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }} sx={{ minWidth: 0, flexShrink: 1 }}>
        {isSmallScreen && (
          <AppIconButton aria-label="Open navigation menu" sx={{ border: 0, width: { xs: 32, sm: "auto" }, minWidth: { xs: 32, sm: 0 }, height: { xs: 32, sm: "auto" }, p: { xs: 0.5, sm: 1 } }} onClick={openSideBar}>
            <MenuOutlined className="fs-32" />
          </AppIconButton>
        )}
        <Avatar
          variant="square"
          alt="Company Logo"
          src={companyLogo || DEFAULT_COMPANY_LOGO}
          className="header-company-logo"
          sx={{
            backgroundColor: "transparent",
            width: "auto",
            minWidth: 0,
            maxWidth: { xs: 94, sm: 160 },
            height: { xs: 34, sm: 38 },
            "& .MuiAvatar-img": {
              objectFit: "contain",
              objectPosition: "left center",
            },
          }}
        />
      </Stack>
      <Stack direction="row" alignItems="center" sx={{ flexGrow: 0, flexShrink: 0, gap: { xs: 0.25, sm: 1 } }}>
        {isCompactScreen ? (
          <AppIconButton aria-label="Search employees" sx={{ border: 0, width: 32, minWidth: 32, height: 32, p: 0.5 }} onClick={() => setIsMobileSearchOpen(true)}>
            <Search />
          </AppIconButton>
        ) : (
          <EmployeeSearchInput />
        )}
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
          }}
        >
          <EmployeeSearchInput autoFocus sx={{ minWidth: 0, width: "100%", flex: 1 }} />
          <AppIconButton aria-label="Close employee search" sx={{ border: 0, flex: "0 0 auto" }} onClick={() => setIsMobileSearchOpen(false)}>
            <Close />
          </AppIconButton>
        </Box>
      )}
    </Stack>
  );
};
