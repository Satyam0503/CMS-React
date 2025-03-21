import * as React from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {
  Grid,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";

import { useLogout } from "../../../../../app/modules/auth";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { colors } from "../../../../../app/modules/theme/MuiTheme";
import { Languages } from "./Languages";
import {
  AccountCircle,
  GTranslate,
  Logout,
  Translate,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function HeaderUserMenu() {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const logout = useLogout();

  const currentUser = useAppSelector((state) => state.user.userData);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const profileImageUrl = useAppSelector(
    (state) => state.user.userData?.profileImage
  );
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  return (
    <>
      <Avatar
        onClick={handleClick}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        src={profileImageUrl}
        variant="rounded"
        sx={{ width: 40, height: 40 }}
      />
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose} sx={{ gap: 1 }} className="pe-none px-2">
          <Avatar
            variant="rounded"
            src={profileImageUrl}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="body1" fontWeight="bold" flexWrap={"wrap"}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography variant="body2">{currentUser?.role || ""}</Typography>
          </Box>
        </MenuItem>
        <Divider/>
        <MenuItem onClick={()=>{
          navigate("/myprofile")
          handleClose();
        }} className="px-2">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage({ id: "USER.ACCOUNT_SETTING" })}
          </ListItemText>
        </MenuItem>
        <MenuItem className="px-2">
          <ListItemIcon>
            <Translate />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage({ id: "USER.LANGUAGE" })}
          </ListItemText>
          <Languages />
        </MenuItem>
        <MenuItem onClick={handleClose} className="px-2">
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText onClick={logout}>
            {intl.formatMessage({ id: "AUTH.SIGNOUT" })}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
