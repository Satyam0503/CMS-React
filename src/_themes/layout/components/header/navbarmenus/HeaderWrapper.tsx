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
};

export const HeaderWrapper: FC<Props> = ({ openSideBar }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const isMobileScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);

  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
        height: "var(--app-header-height)",
        minHeight: "var(--app-header-height)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      className="app-header px-4 flex-row align-items-center justify-content-between position-relative z-3"
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {isSmallScreen && (
          <AppIconButton sx={{ border: 0 }} onClick={openSideBar}>
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
            minWidth: 36,
            maxWidth: { xs: 120, sm: 160 },
            height: 38,
            "& .MuiAvatar-img": {
              objectFit: "contain",
              objectPosition: "left center",
            },
          }}
        />
      </Stack>
      <Stack direction="row" className="align-items-center flex-grow-1 justify-content-end gap-5">
        {isMobileScreen && <EmployeeSearchInput />}
        <Navbar />
      </Stack>
    </Stack>
  );
};
