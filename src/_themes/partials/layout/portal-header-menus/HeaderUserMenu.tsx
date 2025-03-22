import * as React from "react";

import { useLogout } from "../../../../app/modules/auth";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useAppSelector } from "../../../../app/Redux/hooks";
import {
  Grid,
  Link,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { colors } from "../../../../app/modules/theme/MuiTheme";
import { Languages } from "./Languages";

export default function HeaderUserMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const logout = useLogout();

  const currentUser = useAppSelector((state) => state.user.userData);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const profileImageUrl = useAppSelector((state) => state.user.userData?.profileImage);
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Grid container>
        <Box
          sx={{ display: "flex", alignItems: "center", textAlign: "center" }}
        >
          <Tooltip title="User settings">
            <Avatar
              onClick={handleClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              src={profileImageUrl}
              sx={{ borderRadius: ".25rem" }}
            >
              <img alt="profile picture" width={"40px"} height={"40px"} />
            </Avatar>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
        >
          <Grid
            container
            flexDirection={"column"}
            gap={0.5}
            sx={{
              bgcolor: "inherit",
            }}
          >
            <MenuList
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                bgcolor: colors.alpha.neutral[100],
                color: colors.alpha.primary[500],
              }}
            >
              <Avatar sx={{ borderRadius: ".25rem" }} src={profileImageUrl}>
                <img alt="profile picture" width={"40px"} height={"40px"} />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {currentUser?.firstName} {currentUser?.lastName}
                </Typography>
                <Typography variant="body2">
                  {currentUser?.role || ""}
                </Typography>
              </Box>
            </MenuList>
            <Divider sx={{ bgcolor: colors.alpha.neutral[400] }} />
            <MenuList
              onClick={handleClose}
              sx={{
                py: 0.5,
                borderRadius: ".5rem",
                bgcolor: colors.alpha.neutral[100],
                "&:hover": {
                  bgcolor: colors.alpha.neutral[200],
                },
              }}
            >
              <Link
                href="myprofile"
                color={colors.alpha.neutral[800]}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    bgcolor: colors.alpha.neutral[200],
                    color: colors.alpha.primary[500],
                  },
                }}
              >
                <ListItemText primary="Account Settings" />
              </Link>
            </MenuList>
            <MenuList
              onClick={handleClose}
              sx={{
                display: "flex",
                py: 0,
                alignItems: "center",
                borderRadius: ".5rem",
                bgcolor: colors.alpha.neutral[100],
                "&:hover": {
                  bgcolor: colors.alpha.neutral[200],
                  color: colors.alpha.primary[500],
                },
              }}
            >
              <ListItemText primary="Language" />
              <Languages />
            </MenuList>
            <MenuList
              onClick={handleClose}
              sx={{
                display: "flex",
                py: 0.5,
                borderRadius: ".5rem",
                bgcolor: colors.alpha.neutral[100],
                "&:hover": {
                  bgcolor: colors.alpha.neutral[200],
                  color: colors.alpha.primary[500],
                },
              }}
            >
              <ListItemText onClick={logout} primary="Sign Out" />
            </MenuList>
          </Grid>
        </Menu>
      </Grid>
    </>
  );
}
