/** @format */

import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Grid, Link, Stack } from "@mui/material";

import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";

import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export const CareerHeader = () => {
  const intl = useIntl();
  return (
    <Grid
      container
      color="secondary.main"
      bgcolor={"#35126c"}
      className="d-flex justify-content-between align-items-center p-4 position-sticky top-0 z-1"
    >
      <Link href="https://codeji.in/" sx={{ maxWidth: "200px" }}>
        <img
          alt="Logo"
          src={toAbsoluteUrl("media/logos/logo.png")}
          className="w-100 h-100"
        />
      </Link>
      <Stack display={{ xs: "none", sm: "block" }}>
        <List
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
          }}
        >
          <ListItem sx={{ px: 0, gap: 1 }}>
            <ListItemIcon>
              <PhoneAndroidOutlined />
            </ListItemIcon>
            <ListItemText>+917985378534</ListItemText>
          </ListItem>

          <ListItem sx={{ px: 0, gap: 1 }}>
            <ListItemIcon>
              <EmailRounded />
            </ListItemIcon>
            <ListItemText>hello@codeji.in</ListItemText>
          </ListItem>
        </List>
      </Stack>
    </Grid>
  );
}
