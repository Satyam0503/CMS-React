/** @format */

import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { useState } from "react";

export const CareerHeader = () => {
  const theme = useTheme();
  const intl = useIntl();
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
                  fontWeight={'600'}
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
