import * as React from "react";
import {
  AccountCircleOutlined,
  DarkModeOutlined,
  KeyboardArrowDownRounded,
  LightModeOutlined,
  LogoutRounded,
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
import { DEFAULT_USER_AVATAR } from "../../../../../utils/constant/Constant";
import { Languages } from "./Languages";
import { AppStylePicker } from "./AppStylePicker";

export default function HeaderUserMenu() {
  const intl = useIntl();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useAppSelector((state) => state.user.userData);
  const profileImageUrl = currentUser?.profileImage ?? DEFAULT_USER_AVATAR;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { mode, systemMode, setMode } = useColorScheme();
  const open = Boolean(anchorEl);
  const effectiveMode = mode === "system" ? systemMode : mode;
  const displayName = currentUser?.fullName?.trim()
    || `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim()
    || "Account";

  const showIdentity = theme.appStyle === "violet" && !isMobile;

  const close = () => setAnchorEl(null);
  const goTo = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <>
      {showIdentity && <Divider orientation="vertical" flexItem sx={{ my: 2.25, mr: 0.5 }} />}
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
            borderColor: open ? "primary.main" : showIdentity ? "transparent" : "divider",
            bgcolor: open ? "action.selected" : "transparent",
            transition: "border-color 160ms ease, background-color 160ms ease",
            "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
          }}
        >
          <Avatar
            variant="rounded"
            alt={displayName}
            src={profileImageUrl}
            sx={{ width: 38, height: 38, bgcolor: "secondary.main", borderRadius: showIdentity ? "50%" : 2.2 }}
          />
          {showIdentity && (
            <>
              <Box sx={{ textAlign: "left", ml: 1.25, mr: 0.5, maxWidth: 180 }}>
                <Typography variant="body1" fontWeight={700} noWrap lineHeight={1.25}>{displayName}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{currentUser?.jobTitle || "Team member"}</Typography>
              </Box>
              <KeyboardArrowDownRounded sx={{ color: "text.secondary", fontSize: 20 }} />
            </>
          )}
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
              maxHeight: "calc(100dvh - 24px)",
              mt: 1,
              borderRadius: 4,
              overflowY: "auto",
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
        {isMobile && <Box sx={{ px: 2, pt: 1.5, pb: 1.75 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 700, letterSpacing: 0.7 }}>
            Appearance
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 42, mb: 1.25 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Workspace style</Typography>
              <Typography variant="caption" color="text.secondary">Choose a visual theme</Typography>
            </Box>
            <AppStylePicker
              sx={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: 2,
                color: "text.secondary",
                bgcolor: "action.hover",
                "&:hover": { color: "primary.main", bgcolor: "action.selected" },
                "& .MuiSvgIcon-root": { fontSize: 20 },
              }}
            />
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
