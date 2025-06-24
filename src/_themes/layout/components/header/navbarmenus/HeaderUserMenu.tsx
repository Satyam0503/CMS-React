import * as React from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";

import { useLogout } from "../../../../../app/modules/auth";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { Languages } from "./Languages";
import {
  AccountCircle,
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
        alt="User Profile"
        onClick={handleClick}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        src={profileImageUrl}
        variant="rounded"
        className="pe-auto"
        sx={{ width: 40, height: 40, border: 1, borderColor: 'text.secondary', cursor: "pointer" }}
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
            sx={{ width: 40, height: 40, border: 1, borderColor: 'text.disabled', color: "secondary.main" }}
          />
          <Box>
            <Typography variant="body1" fontWeight="bold" flexWrap={"wrap"}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          navigate("/profile")
          handleClose();
        }} className="px-2">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage({ id: "USER.MY_PROFILE" })}
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
        <MenuItem onClick={logout} className="px-2">
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText >
            {intl.formatMessage({ id: "AUTH.SIGNOUT" })}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
