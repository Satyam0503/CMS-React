import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {
  ButtonBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";

import { useAppSelector } from "../../../../../app/Redux/hooks";
import { Languages } from "./Languages";
import {
  AccountCircle,
  Logout,
  Translate,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { DEFAULT_USER_AVATAR } from "../../../../../utils/constant/Constant";

export default function HeaderUserMenu() {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const currentUser = useAppSelector((state) => state.user.userData);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const profileImageUrl = useAppSelector((state) => state.user.userData?.profileImage) ?? DEFAULT_USER_AVATAR;
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  return (
    <>
      <ButtonBase onClick={handleClick} role="button">
        <Avatar
          variant="rounded"
          alt=""
          src={profileImageUrl}
          sx={{ width: 40, height: 40, boxShadow: 2, backgroundColor: "secondary.main" }}
        />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          list: { autoFocus: false }
        }}
      >
        <MenuItem className="pe-none px-2 gap-2">
          <Avatar
            variant="rounded"
            src={profileImageUrl}
            sx={{ width: 40, height: 40, boxShadow: 2, bgcolor: "secondary.main" }}
          />
          <Typography className="fw-bold text-truncate">
            {currentUser?.firstName} {currentUser?.lastName}
          </Typography>
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
        <MenuItem onClick={() => navigate("/logout")} className="px-2">
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
