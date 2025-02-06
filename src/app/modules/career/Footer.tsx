/** @format */

import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Grid, Stack } from "@mui/material";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer_top">
        <div className="container_app">
          <Grid
            container
            className="d-flex justify-content-end justify-content-md-evenly gap-2"
          >
            <Grid item xs={12} sm={6} md={4}>
              <Grid item xs={10} className="footer-widget">
                <Stack className="divider mb-4">
                  <Typography variant="h5" className="fw-semibold">
                    About Us
                  </Typography>
                </Stack>
                <Stack>
                  <Typography paragraph={true} className="fs-14 text-wrap">
                    Codeji InfoTech PVT LTD is best software development
                    company, It's developing high quality and reliable software
                    for corporate needs.
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={4} md={1.5} className="footer-widget">
              <Stack className="divider mb-3 ">
                <Typography variant="h5" className="fw-semibold">
                  Links
                </Typography>
              </Stack>
              <Stack>
                {/* <ul className="footer-list">
                  {menuData.map((menuList, index) => {
                    return (
                      <li key={index}>
                        <a href={menuList.url}>{menuList.title}</a>
                      </li>
                    );
                  })}
                </ul> */}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3.5} className="footer-widget">
              <Stack className="divider mb-2  ">
                <Typography variant="h5" className="fw-semibold">
                  Address
                </Typography>
              </Stack>
              <Stack>
                <List className="contact-list ">
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText>
                      2nd Floor Shri RSR Tower, Kuanwala, Dehradun, Uttarakhand
                      248008
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneAndroidOutlined />
                    </ListItemIcon>
                    <ListItemText>+91 7985378534</ListItemText>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <EmailRounded />
                    </ListItemIcon>
                    <ListItemText>hello@codeji.in</ListItemText>
                  </ListItem>
                </List>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} md={2} className="footer-widget">
              <Stack className="divider mb-3">
                <Typography variant="h5" className="fw-semibold">
                  Follow Us
                </Typography>
              </Stack>
              <Stack>
                <ul className="footer-list list-align">
                  <li>
                    <a
                      href="https://www.facebook.com/codejiinfotech"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FacebookIcon className="fs-2" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/codejiinfotech/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <InstagramIcon className="fs-2" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/company/codeji-infotech"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <LinkedInIcon />
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <WhatsAppIcon className="fs-2" />
                    </a>
                  </li>
                </ul>
              </Stack>
            </Grid>
          </Grid>
        </div>
      </div>
      <Grid item className="footer_bottom ">
        <Typography variant="body2">
          Copyright CodejiInfotech © 2022 Codeji InfoTech Pvt Ltd | Software
          Development Company | In Dehradun
        </Typography>
      </Grid>
    </footer>
  );
}
