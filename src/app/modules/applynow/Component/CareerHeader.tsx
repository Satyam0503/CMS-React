/** @format */

import {
  Box,
  Link,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import clsx from "clsx";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { useState } from "react";

export const CareerHeader = () => {
  const theme = useTheme();
  const [openNav, setOpenNav] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.md)
  );

  function toggleSmallScreenNavar() {
    setOpenNav(!openNav);
  }

  const navlisnks = [
    {
      name: "Home",
      address: "https://codeji.in/",
    },
    {
      name: "About Us",
      address: "https://codeji.in/about-us/",
    },
    {
      name: "Services",
      address: "https://codeji.in/services/",
    },
    {
      name: "Contact Us",
      address: "https://codeji.in/contact-us/",
    },
    {
      name: "Careers",
      address: "",
    },
  ];

  return (
    <Box component="div" className="w-100 position-fixed top-0 z-2 ">
      <Stack
        direction="row"
        sx={{ backgroundColor: "common.white" }}
        className={clsx(
          " px-6 px-lg-8 py-4 justify-content-between align-items-center p shadow-sm "
        )}
      >
        <Link href="https://codeji.in/" sx={{ maxWidth: "160px" }}>
          <img
            alt="Logo"
            src={toAbsoluteUrl("media/logos/favicon.png")}
            className="w-100 h-100"
          />
        </Link>
        <Stack direction="row" className="gap-6">
          {!isSmallScreen ? (
            navlisnks.map((link, index) => {
              return (
                <Link
                  href={link.address}
                  underline="none"
                  color="common.black"
                  className="fs-16"
                  key={index}
                  sx={{
                    fontWeight: '600',

                    "&:hover": {
                      color: "primary.main",
                    }
                  }}>
                  {link.name}
                </Link>
              );
            })
          ) : !openNav ? (
            <MenuIcon className="fs-28" onClick={toggleSmallScreenNavar} />
          ) : (
            <CloseIcon className="fs-28" onClick={toggleSmallScreenNavar} />
          )}
        </Stack>
      </Stack>
      {isSmallScreen && (
        <Box
          component="div"
          className={clsx("sml-screen-navlinks px-6 shadow-sm", {
            "sml-screen-navlinks-enabled ": openNav,
          })}
        >
          {navlisnks.map((link, index) => {
            return (
              <Link
                href={link.address}
                underline="none"
                color="common.black"
                className="fs-20 sml-screen-navlink"
                key={index}
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
