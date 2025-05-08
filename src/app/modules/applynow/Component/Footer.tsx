/** @format */

import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Container, Divider, Grid, Link, Stack } from "@mui/material";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { colors } from "../../theme/MuiTheme";

export default function Footer() {
  const intl = useIntl();
  return (
    <footer className="footer">
      <Grid container>
        <Container
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-evenly",
            gap: 4,
            color: colors.white[500],
          }}
        >
          <Grid item xs={12} md={3}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h3">
                  {" "}
                  {intl.formatMessage({
                    id: "MENU.ABOUT_US",
                  })}
                </Typography>
              </Stack>
              <Stack
                divider={<Divider orientation="horizontal" />}
                bgcolor={colors.secondary[500]}
                borderRadius={2}
                height={"5px"}
                width={"25%"}
              />
              <Stack>
                <Typography
                  variant="body1"
                  flexWrap={"wrap"}
                  maxWidth={"450px"}
                >
                  {intl.formatMessage({
                    id: "COMPANY.DESCRIPTION",
                  })}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={1.5}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h3">
                  {intl.formatMessage({
                    id: "COLOR.LINKS",
                  })}
                </Typography>
              </Stack>
              <Stack
                divider={<Divider orientation="horizontal" />}
                bgcolor={colors.secondary[500]}
                borderRadius={2}
                height={"5px"}
                width={"25%"}
              />

              <Stack gap={1}>
                <Link href="https://codeji.in/" color={colors.white[500]}>
                  <Typography>Home</Typography>
                </Link>
                <Link
                  href="https://codeji.in/about-us/"
                  color={colors.white[500]}
                >
                  <Typography>About Us</Typography>
                </Link>
                <Link
                  href="          https://codeji.in/services/"
                  color={colors.white[500]}
                >
                  <Typography>Services</Typography>
                </Link>

                <Link
                  href="https://admin.codeji.in/careers/apply-now"
                  color={colors.white[500]}
                >
                  <Typography>Career</Typography>
                </Link>
                <Link
                  href="https://codeji.in/contact-us/"
                  color={colors.white[500]}
                >
                  <Typography>Contact Us</Typography>
                </Link>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h3">Address</Typography>
              </Stack>
              <Stack
                divider={<Divider orientation="horizontal" />}
                bgcolor={colors.secondary[500]}
                borderRadius={2}
                height={"5px"}
                width={"25%"}
              />
              <Stack textAlign={"justify"}>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ p: 0, gap: 1 }}>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText>
                      2nd Floor Shri RSR Tower, Kuanwala, Dehradun, Uttarakhand
                      248008
                    </ListItemText>
                  </ListItem>
                  <ListItem sx={{ px: 0, gap: 1 }}>
                    <ListItemIcon>
                      <PhoneAndroidOutlined />
                    </ListItemIcon>
                    <ListItemText>+91-7985378534</ListItemText>
                  </ListItem>

                  <ListItem sx={{ px: 0, gap: 1 }}>
                    <ListItemIcon>
                      <EmailRounded />
                    </ListItemIcon>
                    <ListItemText>hello@codeji.in</ListItemText>
                  </ListItem>
                </List>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h3">Follow Us</Typography>
              </Stack>
              <Stack
                divider={<Divider orientation="horizontal" />}
                bgcolor={colors.secondary[500]}
                borderRadius={2}
                height={"5px"}
                width={"25%"}
              />
              <Stack direction={"row"} gap={1}>
                <Link
                  href="https://www.facebook.com/codejiinfotech"
                  color={colors.white[500]}
                >
                  <FacebookIcon fontSize="large" />
                </Link>
                <Link
                  href="https://www.instagram.com/codejiinfotech/"
                  color={colors.white[500]}
                >
                  <InstagramIcon fontSize="large" />
                </Link>

                <Link
                  href="https://www.linkedin.com/company/codeji-infotech"
                  color={colors.white[500]}
                >
                  <LinkedInIcon fontSize="large" />
                </Link>
                <Link href="#" color={colors.white[500]}>
                  <WhatsAppIcon fontSize="large" />
                </Link>
              </Stack>
            </Stack>
          </Grid>
        </Container>
      </Grid>
      <Grid item textAlign={"center"} bgcolor={" #35126c"} p={1}>
        <Typography variant="body2">
          {intl.formatMessage({ id: "APPLICATION.COPYRIGHT" })}
        </Typography>
      </Grid>
    </footer>
  );
}
