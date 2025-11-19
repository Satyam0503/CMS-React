/** @format */

import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Box, Container, Divider, Grid, Link, Stack } from "@mui/material";
import companyLogo from '../../../../../public/media/logos/favicon.png'

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";

export default function Footer() {
  const intl = useIntl();
  return (
    <footer className="footer">
      <Grid container>
        <Container
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 4,
            color: "common.black",
          }}
        >
          <Box component={'div'} className="footer-company-logo">
            <Stack spacing={1}>
              <Box component={'div'} className="footer-company-logo-container">
                <img src={companyLogo} alt="" />
              </Box>
              <Stack
                divider={<Divider orientation="horizontal" />}
                sx={{
                  bgcolor: "seconday.main",
                  borderRadius: 2,
                  height: "5px",
                  width: "25%"
                }} />
              <Stack>
                <Typography
                  variant="body2"
                  sx={{
                    flexWrap: "wrap",
                    maxWidth: "450px"
                  }}>
                  {intl.formatMessage({
                    id: "COMPANY.DESCRIPTION",
                  })}
                </Typography>
              </Stack>

              <Stack direction={"row"} sx={{
                gap: 2
              }}>
                <Link
                  className="footer-company-socials"
                  href="https://www.facebook.com/codejiinfotech"
                  color="common.black"
                >
                  <FacebookIcon fontSize="large" />
                </Link>
                <Link
                  className="footer-company-socials"
                  href="https://www.instagram.com/codejiinfotech/"
                  color="common.black"
                >
                  <InstagramIcon fontSize="large" />
                </Link>

                <Link
                  className="footer-company-socials"
                  href="https://www.linkedin.com/company/codeji-infotech"
                  color="common.black"
                >
                  <LinkedInIcon fontSize="large" />
                </Link>
                <Link href="#"
                  className="footer-company-socials"
                  color="common.black">
                  <WhatsAppIcon fontSize="large" />
                </Link>
              </Stack>
            </Stack>
          </Box>

          <Box component={'div'} className="footer-company-links">
            <Stack spacing={1} className="footer-company-links-nav">
              <Stack>
                <Typography variant="h6" sx={{ fontWeight: '600' }}>
                  Links
                </Typography>
              </Stack>

              <Stack sx={{
                gap: 1
              }}>
                <Link href="https://codeji.in/" color="common.black">
                  <Typography>Home</Typography>
                </Link>
                <Link href="https://codeji.in/about-us/" color="common.black">
                  <Typography>About Us</Typography>
                </Link>
                <Link
                  href="https://codeji.in/services/"
                  color="common.black"
                >
                  <Typography>Services</Typography>
                </Link>

                <Link
                  href="https://admin.codeji.in/careers/apply-now"
                  color="common.black"
                >
                  <Typography>Career</Typography>
                </Link>
                <Link href="https://codeji.in/contact-us/" color="common.black" >
                  <Typography>Contact Us</Typography>
                </Link>
              </Stack>
            </Stack>

            <Stack spacing={1} >
              <Stack>
                <Typography variant="h6" sx={{ fontWeight: '600' }}>
                  Address
                </Typography>
              </Stack>
              <Stack sx={{
                textAlign: "justify"
              }}>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ p: 0, gap: 1 }}>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText className="footer-address-text">
                      2nd Floor Shri RSR Tower, Kuanwala, Dehradun, Uttarakhand
                      248008
                    </ListItemText>
                  </ListItem>
                  <ListItem sx={{ px: 0, gap: 1 }}>
                    <ListItemIcon>
                      <PhoneAndroidOutlined />
                    </ListItemIcon>
                    <ListItemText className="footer-address-text">+91-7985378534</ListItemText>
                  </ListItem>

                  <ListItem sx={{ px: 0, gap: 1 }}>
                    <ListItemIcon>
                      <EmailRounded />
                    </ListItemIcon>
                    <ListItemText className="footer-address-text">hello@codeji.in</ListItemText>
                  </ListItem>
                </List>
              </Stack>
            </Stack>
          </Box>

        </Container>
      </Grid>
      <Grid
        sx={{
          textAlign: "center",
          bgcolor: " #ffffffff",
          p: 1,
          borderTop: '2px solid rgb(233, 233, 233)'
        }}>
        <Typography sx={{ fontSize: '10px' }}>
          {intl.formatMessage({ id: "APPLICATION.COPYRIGHT" })}
        </Typography>
      </Grid>
    </footer>
  );
}
