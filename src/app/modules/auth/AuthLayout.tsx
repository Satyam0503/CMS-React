import { Outlet } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import {
  Box,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  CheckCircleRounded,
  Groups2Rounded,
  ShieldRounded,
} from "@mui/icons-material";
import { Languages } from "../../../_themes/layout/components/header/navbarmenus/Languages";
import LightDarkMode from "../../../_themes/layout/components/header/navbarmenus/LightDarkMode";

const benefits = [
  { icon: <Groups2Rounded />, label: "People and operations, connected" },
  { icon: <ShieldRounded />, label: "Secure role-based workspace" },
  { icon: <AutoAwesomeRounded />, label: "Simple, productive workflows" },
];

const AuthLayout = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
        backgroundImage: isDark
          ? "radial-gradient(circle at 12% 15%, rgba(145, 76, 255, .16), transparent 32%), radial-gradient(circle at 88% 85%, rgba(56, 189, 248, .09), transparent 34%)"
          : "radial-gradient(circle at 12% 15%, rgba(145, 76, 255, .13), transparent 32%), radial-gradient(circle at 88% 85%, rgba(56, 189, 248, .11), transparent 34%)",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          top: -260,
          right: -130,
          background: "linear-gradient(135deg, rgba(160, 82, 255, .28), rgba(79, 70, 229, .04))",
          filter: "blur(2px)",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ minHeight: "100vh", py: { xs: 2, md: 3 }, position: "relative" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: 48, mb: { xs: 2, md: 3 } }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              component="img"
              src={toAbsoluteUrl("media/logos/favicon.png")}
              alt="CodeJi CMS"
              sx={{ height: 34, width: "auto", objectFit: "contain" }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LightDarkMode />
            <Languages />
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.05fr) minmax(420px, .95fr)" },
            minHeight: { md: "calc(100vh - 126px)" },
            borderRadius: { xs: 4, md: 6 },
            overflow: "hidden",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.08)",
            boxShadow: isDark ? "0 32px 90px rgba(0,0,0,.34)" : "0 32px 90px rgba(57,31,105,.14)",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              position: "relative",
              overflow: "hidden",
              color: "common.white",
              p: { md: 6, lg: 8 },
              background: "linear-gradient(145deg, #402070 0%, #6d36b3 48%, #a74ee7 100%)",
              "&::before": {
                content: '""', position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle at 15% 25%, rgba(255,255,255,.18) 0 2px, transparent 3px), radial-gradient(circle at 75% 70%, rgba(255,255,255,.12) 0 1px, transparent 2px)",
                backgroundSize: "70px 70px, 42px 42px", opacity: .7,
              },
              "&::after": {
                content: '""', position: "absolute", width: 430, height: 430, borderRadius: "50%",
                right: -190, bottom: -220, border: "75px solid rgba(255,255,255,.08)",
              },
            }}
          >
            <Stack justifyContent="space-between" sx={{ position: "relative", zIndex: 1, width: "100%" }}>
              <Box>
                <Chip
                  icon={<AutoAwesomeRounded sx={{ color: "white !important" }} />}
                  label="Modern workforce management"
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,.14)", backdropFilter: "blur(8px)", mb: 4 }}
                />
                <Typography variant="h2" fontWeight={800} lineHeight={1.08} letterSpacing="-.045em" maxWidth={620} sx={{ color: "common.white" }}>
                  Everything your team needs to do their best work.
                </Typography>
                <Typography variant="h6" fontWeight={400} sx={{ mt: 2.5, opacity: .82, lineHeight: 1.65, maxWidth: 570, color: "common.white" }}>
                  Bring employee records, attendance, leave, payroll, and hiring into one calm, connected workspace.
                </Typography>
              </Box>

              <Stack spacing={2.25} sx={{ mt: 6 }}>
                {benefits.map((benefit) => (
                  <Stack key={benefit.label} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 2.5, bgcolor: "rgba(255,255,255,.14)" }}>
                      {benefit.icon}
                    </Box>
                    <Typography fontWeight={600} sx={{ color: "common.white" }}>{benefit.label}</Typography>
                    <CheckCircleRounded sx={{ ml: "auto !important", opacity: .7, fontSize: 20 }} />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Stack
            justifyContent="center"
            sx={{
              px: { xs: 3, sm: 6, lg: 9 },
              py: { xs: 5, md: 6 },
              minWidth: 0,
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 500, mx: "auto" }}>
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export { AuthLayout };
