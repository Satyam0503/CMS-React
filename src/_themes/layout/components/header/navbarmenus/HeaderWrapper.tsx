import {
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { Navbar } from "./Navbar";
import { MenuOutlined } from "@mui/icons-material";

import { EmployeeSearchInput } from "./EmployeeSearchInput";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { DEFAULT_COMPANY_LOGO } from "../../../../../utils/constant/Constant";

import { AppIconButton } from "../../../../../app/shared/components/ui";
type Props = {
  openSideBar: () => void;
  isMiniSidebar: boolean;
};

export const HeaderWrapper: FC<Props> = ({ openSideBar, isMiniSidebar }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const isMobileScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);

  // On desktop the logo always lives in the sidebar, including its collapsed
  // state. Keep a header logo only on small screens where the drawer is temporary.
  const showHeaderLogo = isSmallScreen;

  // Sidebar paper sits at the left edge with a higher z-index than the header,
  // so without this dodge it covers the header's left content (logo, hamburger).
  // Mirror the inner content's marginLeft so the header starts AFTER the sidebar.
  const sidebarOffset = isSmallScreen ? 0 : isMiniSidebar ? "90px" : "265px";

  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
        marginLeft: sidebarOffset,
        transition: "margin .3s linear",
      }}
      className="app-header p-4 flex-row align-items-center justify-content-between position-sticky top-0 z-3"
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {isSmallScreen && (
          <AppIconButton sx={{ border: 0 }} onClick={openSideBar}>
            <MenuOutlined className="fs-32" />
          </AppIconButton>
        )}
        {showHeaderLogo && (
          <Avatar
            variant="square"
            alt="Company Logo"
            src={companyLogo || DEFAULT_COMPANY_LOGO}
            className="header-company-logo"
            sx={{
              backgroundColor: "transparent",
              width: "auto",
              maxWidth: 140,
              height: 32,
              "& .MuiAvatar-img": {
                objectFit: "contain",
                objectPosition: "left center",
              },
            }}
          />
        )}
      </Stack>
      <Stack direction="row" className="align-items-center flex-grow-1 justify-content-end gap-5">
        {isMobileScreen && <EmployeeSearchInput />}
        <Navbar />
      </Stack>
    </Stack>
  );
};
