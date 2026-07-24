import * as React from "react";
import {
  AccountCircleOutlined,
  CheckRounded,
  DarkModeOutlined,
  LightModeOutlined,
  LogoutRounded,
  PaletteOutlined,
  TranslateRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { APP_STYLES, useAppStyle } from "../../../../../app/modules/theme/useAppStyle";
import { DEFAULT_USER_AVATAR } from "../../../../../utils/constant/Constant";
import { Languages } from "./Languages";

export default function HeaderUserMenu() {
  const intl = useIntl();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useAppSelector((state) => state.user.userData);
  const profileImageUrl = currentUser?.profileImage ?? DEFAULT_USER_AVATAR;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { mode, systemMode, setMode } = useColorScheme();
  const { style, setStyle } = useAppStyle();
  const open = Boolean(anchorEl);
  const effectiveMode = mode === "system" ? systemMode : mode;
  const displayName = currentUser?.fullName?.trim()
    || `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim()
    || "Account";

  const close = () => setAnchorEl(null);
  const goTo = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <>
      <Tooltip title="Account and appearance">
        <ButtonBase
          id="profile-menu-button"
          aria-label="Open account and appearance menu"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            borderRadius: 2.5,
            p: .35,
            border: "1px solid",
            borderColor: open ? "primary.main" : "divider",
            bgcolor: open ? "action.selected" : "transparent",
            transition: "border-color 160ms ease, background-color 160ms ease",
            "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
          }}
        >
          <Avatar
            variant="rounded"
            alt={displayName}
            src={profileImageUrl}
            sx={{ width: 38, height: 38, bgcolor: "secondary.main", borderRadius: 2.2 }}
          />
        </ButtonBase>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={close}
        MenuListProps={{ "aria-labelledby": "profile-menu-button", autoFocusItem: false, sx: { p: 0 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "calc(100vw - 24px)", sm: isMobile ? 360 : 310 },
              maxWidth: isMobile ? 380 : 310,
              mt: 1,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none",
              boxShadow: "0 20px 60px color-mix(in srgb, var(--mui-palette-common-black) 20%, transparent)",
            },
          },
        }}
      >
        <Box sx={{ p: 2, background: "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 14%, var(--mui-palette-background-paper)), var(--mui-palette-background-paper))" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={profileImageUrl} alt={displayName} sx={{ width: 54, height: 54, borderRadius: 3, bgcolor: "secondary.main", border: "2px solid", borderColor: "background.paper" }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap>{displayName}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{currentUser?.jobTitle || "Team member"}</Typography>
              {currentUser?.companyName && <Typography variant="caption" color="text.secondary" noWrap>{currentUser.companyName}</Typography>}
            </Box>
          </Stack>
        </Box>

        <Divider />
        <Box sx={{ p: 1 }}>
          <MenuItem onClick={() => goTo("/profile")} sx={{ minHeight: 48, borderRadius: 2.5 }}>
            <ListItemIcon><AccountCircleOutlined /></ListItemIcon>
            <ListItemText primary={intl.formatMessage({ id: "USER.MY_PROFILE" })} />
          </MenuItem>
          <MenuItem sx={{ minHeight: 48, borderRadius: 2.5 }}>
            <ListItemIcon><TranslateRounded /></ListItemIcon>
            <ListItemText primary={intl.formatMessage({ id: "USER.LANGUAGE" })} />
            <Languages />
          </MenuItem>
        </Box>

        {isMobile && <Divider />}
        {isMobile && <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
            <PaletteOutlined color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={800}>Appearance</Typography>
          </Stack>

          <Stack direction="row" role="group" aria-label="Color mode" sx={{ p: .5, bgcolor: "background.default", borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            {([
              { value: "light", label: "Light", icon: <LightModeOutlined fontSize="small" /> },
              { value: "dark", label: "Dark", icon: <DarkModeOutlined fontSize="small" /> },
            ] as const).map((option) => {
              const selected = effectiveMode === option.value;
              return (
                <ButtonBase
                  key={option.value}
                  aria-pressed={selected}
                  onClick={() => setMode(option.value)}
                  sx={{
                    flex: 1, gap: .7, py: .85, px: 1, borderRadius: 2,
                    color: selected ? "primary.main" : "text.secondary",
                    bgcolor: selected ? "background.paper" : "transparent",
                    boxShadow: selected ? "0 3px 10px color-mix(in srgb, var(--mui-palette-common-black) 10%, transparent)" : "none",
                  }}
                >
                  {option.icon}<Typography variant="body2" fontWeight={selected ? 750 : 500}>{option.label}</Typography>
                </ButtonBase>
              );
            })}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.8, mb: .8 }}>Interface style</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: .8 }}>
            {APP_STYLES.map((option) => {
              const selected = option.value === style;
              return (
                <ButtonBase
                  key={option.value}
                  aria-label={`${option.label} interface style`}
                  aria-pressed={selected}
                  onClick={() => setStyle(option.value)}
                  sx={{
                    position: "relative", justifyContent: "flex-start", p: 1, borderRadius: 2,
                    border: "1px solid", borderColor: selected ? "primary.main" : "divider",
                    bgcolor: selected ? "action.selected" : "transparent",
                    "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                  }}
                >
                  <Typography variant="caption" fontWeight={selected ? 800 : 600} noWrap>{option.label}</Typography>
                  {selected && <CheckRounded sx={{ position: "absolute", right: 5, top: 5, fontSize: 14, color: "primary.main" }} />}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>}

        <Divider />
        <Box sx={{ p: 1 }}>
          <MenuItem onClick={() => goTo("/logout")} sx={{ minHeight: 48, borderRadius: 2.5, color: "error.main", "& .MuiListItemIcon-root": { color: "error.main" } }}>
            <ListItemIcon><LogoutRounded /></ListItemIcon>
            <ListItemText primary={intl.formatMessage({ id: "AUTH.SIGNOUT" })} />
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}
