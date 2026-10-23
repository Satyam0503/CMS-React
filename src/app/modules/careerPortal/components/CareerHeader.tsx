import {
  AutoAwesomeRounded,
  BookmarkBorderRounded,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Btn } from "../../../shared/components/ui";
import LightDarkMode from "../../../../_themes/layout/components/header/navbarmenus/LightDarkMode";

export const CareerHeader = () => (
  <Box
    component="header"
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      bgcolor: "color-mix(in srgb, var(--mui-palette-background-paper) 88%, transparent)",
      backdropFilter: "blur(18px)",
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: { xs: 64, sm: 72 } }}>
        <Stack
          component={Link}
          to="/careers"
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ color: "text.primary", textDecoration: "none" }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: "primary.contrastText",
              background: "linear-gradient(135deg, var(--mui-palette-primary-light), var(--mui-palette-primary-dark))",
            }}
          >
            <AutoAwesomeRounded fontSize="small" />
          </Box>
          <Box>
            <Typography fontWeight={900} lineHeight={1}>Codeji Careers</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>Find work that fits</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <LightDarkMode sx={{ width: 36, height: 36, mr: 0.5 }} />
          <Btn component={Link} to="/careers/saved" color="inherit" startIcon={<BookmarkBorderRounded />} sx={{ minWidth: { xs: 40, sm: "auto" }, px: { xs: 1, sm: 1.5 } }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Saved jobs</Box>
          </Btn>
          <Btn component={Link} to="/careers/preferences" color="inherit" startIcon={<NotificationsNoneRounded />} sx={{ minWidth: { xs: 40, sm: "auto" }, px: { xs: 1, sm: 1.5 } }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Job alerts</Box>
          </Btn>
        </Stack>
      </Stack>
    </Container>
  </Box>
);
