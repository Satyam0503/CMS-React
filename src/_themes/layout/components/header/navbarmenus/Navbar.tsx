import { Stack, useMediaQuery, useTheme } from "@mui/material";
import HeaderNotificationMenu from "./HeaderNotificationMenu";
import HeaderUserMenu from "./HeaderUserMenu";
import LightDarkMode from "./LightDarkMode";
import { AppStylePicker } from "./AppStylePicker";

const Navbar = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));

  return (
    <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 0.75, md: 1 }}>
      {!isSmallScreen && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            pr: 0.75,
            mr: 0.25,
            borderRight: "1px solid",
            borderColor: "divider",
            "& .MuiIconButton-root": {
              width: 36,
              height: 36,
              borderRadius: 2,
              color: "text.secondary",
              transition: "background-color 160ms ease, color 160ms ease",
              "&:hover": { bgcolor: "action.hover", color: "primary.main" },
              "& .MuiSvgIcon-root": { fontSize: 20 },
            },
          }}
        >
          <AppStylePicker />
          <LightDarkMode />
        </Stack>
      )}
      <HeaderNotificationMenu />
      <HeaderUserMenu />
    </Stack>
  );
};

export { Navbar };
