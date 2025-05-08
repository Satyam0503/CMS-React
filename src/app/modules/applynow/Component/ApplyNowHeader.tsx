/** @format */

import { PhoneAndroidOutlined } from "@mui/icons-material";
import { EmailRounded } from "@mui/icons-material";
import { Grid, Link, Stack } from "@mui/material";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { useIntl } from "react-intl";
import { colors } from "../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function ApplyNowHeader() {
  const intl = useIntl();
  return (
    <Grid
      container
      color={colors.secondary[500]}
      bgcolor={"#35126c"}
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent={"space-between"}
      px={5}
      py={{ xs: 2, md: 1 }}
      alignItems={"center"}
    >
      <Stack>
        <Link href="https://codeji.in/" style={{ alignItems: "center" }}>
          <img
            alt="Logo"
            src={toAbsoluteUrl("media/logos/logo.png")}
            style={{ minWidth: "50px" }}
          />
        </Link>
      </Stack>
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
