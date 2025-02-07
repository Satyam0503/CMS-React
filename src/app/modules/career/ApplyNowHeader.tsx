/** @format */

import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Grid, Link, ListItemButton, Stack } from "@mui/material";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { colors } from "../theme/MuiTheme";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";

export default function ApplyNowHeader() {
  const intl = useIntl();
  return (
    <Grid
      container
      color={colors.alpha.secondary[500]}
      bgcolor={"#35126c"}
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent={"space-between"}
      px={5}
    >
      <Stack>
        <Link href="https://codeji.in/" style={{ marginTop: "1rem" }}>
          <img
            alt="Logo"
            src={toAbsoluteUrl("media/logos/logo.png")}
            style={{ minWidth: "50px" }}
          />
        </Link>
      </Stack>
      <Stack>
        <List
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
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
