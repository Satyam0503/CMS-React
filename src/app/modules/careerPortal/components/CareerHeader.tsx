import {
  AutoAwesomeRounded,
  BookmarkBorderRounded,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 72 }}>
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
            <Typography variant="caption" color="text.secondary">Find work that fits</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Button component={Link} to="/careers/saved" color="inherit" startIcon={<BookmarkBorderRounded />}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Saved jobs</Box>
          </Button>
          <Button component={Link} to="/careers/preferences" color="inherit" startIcon={<NotificationsNoneRounded />}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Job alerts</Box>
          </Button>
        </Stack>
      </Stack>
    </Container>
  </Box>
);
