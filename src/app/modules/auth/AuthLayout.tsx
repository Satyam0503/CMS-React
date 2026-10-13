import { Link, Outlet } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import {
  Box,
  Container,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/material";
import {
  LockOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { Languages } from "../../../_themes/layout/components/header/navbarmenus/Languages";
import LightDarkMode from "../../../_themes/layout/components/header/navbarmenus/LightDarkMode";
import { useCompanyTheme } from "../theme/companyTheme";

const AuthLayout = () => {
  const { mode, systemMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  const { theme: style } = useCompanyTheme();
  const isDawn = style === "dawn";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        position: "relative",
        overflowX: "hidden",
        bgcolor: isDark ? "#090d16" : "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 2.5 },
        }}
      >
        {/* Clean, Non-Colliding Top Navigation */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            height: 48,
            mb: { xs: 2, md: 3 },
          }}
        >
          {/* Brand Logo - Clean Image Lockup (No Overlapping Text) */}
          <Box
            component={Link}
            to="/auth"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "opacity 0.2s ease",
              "&:hover": { opacity: 0.85 },
            }}
          >
            <Box
              component="img"
              src={toAbsoluteUrl("media/logos/favicon.png")}
              alt="CodeJi"
              sx={{
                height: 32,
                width: "auto",
                maxWidth: 160,
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          {/* Controls: Theme & Localization */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                p: 0.25,
              }}
            >
              <LightDarkMode
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  color: isDark ? "secondary.light" : "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Languages />
            </Box>
          </Stack>
        </Stack>

        {/* Central Auth Shell Card */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "0.95fr 1.05fr" },
            flexGrow: 1,
            minHeight: { xs: "auto", md: "calc(100dvh - 120px)" },
            borderRadius: { xs: 3, md: 4 },
            overflow: "hidden",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.5)"
              : "0 20px 50px rgba(15,23,42,0.06)",
            bgcolor: isDark ? "#0f172a" : "#ffffff",
            mb: { xs: 2, md: 0 },
          }}
        >
          {/* Left Hero Panel (Restrained, Classy Editorial) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              p: { md: 5, lg: 6, xl: 7 },
              bgcolor: isDawn ? "#1e1628" : isDark ? "#0b1120" : "#0f172a",
              color: "#ffffff",
            }}
          >
            {/* Top Brand Statement */}
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  mb: 2,
                }}
              >
                Enterprise Workforce & Payroll
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { md: "2.1rem", lg: "2.35rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  mb: 2,
                }}
              >
                Workforce operations, perfected.
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                }}
              >
                A unified platform for team lifecycle, attendance automation, and statutory payroll compliance.
              </Typography>
            </Box>

            {/* Middle Editorial Highlight */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                my: 4,
                p: 3,
                borderRadius: 2.5,
                bgcolor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
                maxWidth: 460,
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  mb: 2,
                }}
              >
                &ldquo;CodeJi delivers the accuracy and speed required for multi-branch attendance and instant payroll reconciliation.&rdquo;
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    display: "grid",
                    placeItems: "center",
                    color: "primary.light",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  C
                </Box>
                <Box>
                  <Typography sx={{ color: "common.white", fontSize: "0.82rem", fontWeight: 600 }}>
                    Operations & People Team
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.72rem" }}>
                    CodeJi Enterprise Infrastructure
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Bottom Security Reassurance */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={3}
              sx={{
                position: "relative",
                zIndex: 1,
                pt: 3,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.78rem",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <LockOutlined sx={{ fontSize: 15 }} />
                <span>256-Bit TLS Encryption</span>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShieldOutlined sx={{ fontSize: 15 }} />
                <span>Tenant Data Isolation</span>
              </Stack>
            </Stack>
          </Box>

          {/* Right Form Container */}
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              width: "100%",
              height: "100%",
              px: { xs: 2.5, sm: 4, md: 5, lg: 6 },
              py: { xs: 4, md: 5 },
              overflowY: "auto",
              boxSizing: "border-box",
              bgcolor: isDark ? "#0f172a" : "#ffffff",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 440, md: 460 },
                mx: "auto",
              }}
            >
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export { AuthLayout };
