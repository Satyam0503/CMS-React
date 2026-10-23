import { FC, MouseEvent, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Popover,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import BusinessRounded from "@mui/icons-material/BusinessRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import Palette from "@mui/icons-material/Palette";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import { useIntl } from "react-intl";
import { APP_STYLES, AppStyle, useAppStyle } from "../../../../../app/modules/theme/useAppStyle";
import { useCompanyTheme } from "../../../../../app/modules/theme/companyTheme";
import { useIsDark } from "../../../../../app/modules/theme/useIsDark";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { putRequest } from "../../../../../server/axios";
import { toast } from "react-toastify";
import { AppIconButton } from "../../../../../app/shared/components/ui";

interface ThemePreviewPalette {
  canvasBg: string;
  headerBg: string;
  headerBorder: string;
  sidebarBg: string;
  sidebarBorder: string;
  cardBg: string;
  cardBorder: string;
  cardSecondaryBg: string;
  cardSecondaryBorder: string;
  navActive: string;
  navItem: string;
  accent: string;
  textPrimary: string;
  textMuted: string;
}

const PREVIEW_PALETTES: Record<"light" | "dark", Record<AppStyle, ThemePreviewPalette>> = {
  light: {
    glass: {
      canvasBg: "linear-gradient(135deg, #e4eff8 0%, #d8e8f6 50%, #eaf3fa 100%)",
      headerBg: "rgba(255, 255, 255, 0.88)",
      headerBorder: "rgba(255, 255, 255, 0.95)",
      sidebarBg: "rgba(255, 255, 255, 0.78)",
      sidebarBorder: "rgba(255, 255, 255, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.85)",
      cardBorder: "rgba(255, 255, 255, 0.95)",
      cardSecondaryBg: "rgba(255, 255, 255, 0.65)",
      cardSecondaryBorder: "rgba(255, 255, 255, 0.85)",
      navActive: "#0B5CAB",
      navItem: "rgba(11, 92, 171, 0.22)",
      accent: "#0B5CAB",
      textPrimary: "#0f172a",
      textMuted: "rgba(15, 23, 42, 0.45)",
    },
    slate: {
      canvasBg: "linear-gradient(135deg, #f1f5f9 0%, #e8eef5 50%, #f1f5f9 100%)",
      headerBg: "#FFFFFF",
      headerBorder: "#E2E8F0",
      sidebarBg: "#FFFFFF",
      sidebarBorder: "#E2E8F0",
      cardBg: "#FFFFFF",
      cardBorder: "#E2E8F0",
      cardSecondaryBg: "#F8FAFC",
      cardSecondaryBorder: "#E2E8F0",
      navActive: "#0284c7",
      navItem: "#cbd5e1",
      accent: "#0284c7",
      textPrimary: "#0f172a",
      textMuted: "#94a3b8",
    },
    dawn: {
      canvasBg: "linear-gradient(135deg, #f5e8fa 0%, #faedf6 50%, #fbe9f2 100%)",
      headerBg: "rgba(255, 255, 255, 0.88)",
      headerBorder: "rgba(255, 255, 255, 0.95)",
      sidebarBg: "rgba(255, 255, 255, 0.75)",
      sidebarBorder: "rgba(255, 255, 255, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.85)",
      cardBorder: "rgba(255, 255, 255, 0.95)",
      cardSecondaryBg: "rgba(255, 255, 255, 0.65)",
      cardSecondaryBorder: "rgba(255, 255, 255, 0.85)",
      navActive: "#9333ea",
      navItem: "rgba(147, 51, 234, 0.22)",
      accent: "#9333ea",
      textPrimary: "#3b0764",
      textMuted: "rgba(59, 7, 100, 0.45)",
    },
    blush: {
      canvasBg: "linear-gradient(135deg, #fce7f3 0%, #fff1f5 50%, #fce9f0 100%)",
      headerBg: "rgba(255, 255, 255, 0.88)",
      headerBorder: "rgba(255, 255, 255, 0.95)",
      sidebarBg: "rgba(255, 255, 255, 0.75)",
      sidebarBorder: "rgba(255, 255, 255, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.85)",
      cardBorder: "rgba(255, 255, 255, 0.95)",
      cardSecondaryBg: "rgba(255, 255, 255, 0.65)",
      cardSecondaryBorder: "rgba(255, 255, 255, 0.85)",
      navActive: "#db2777",
      navItem: "rgba(219, 39, 119, 0.22)",
      accent: "#db2777",
      textPrimary: "#4a044e",
      textMuted: "rgba(74, 4, 78, 0.45)",
    },
  },
  dark: {
    glass: {
      canvasBg: "linear-gradient(135deg, #09151b 0%, #0d2029 50%, #10262b 100%)",
      headerBg: "rgba(9, 20, 27, 0.92)",
      headerBorder: "rgba(171, 213, 222, 0.22)",
      sidebarBg: "rgba(15, 29, 38, 0.92)",
      sidebarBorder: "rgba(171, 213, 222, 0.22)",
      cardBg: "rgba(20, 38, 49, 0.90)",
      cardBorder: "rgba(171, 213, 222, 0.25)",
      cardSecondaryBg: "rgba(15, 29, 38, 0.82)",
      cardSecondaryBorder: "rgba(171, 213, 222, 0.18)",
      navActive: "#2dd4bf",
      navItem: "rgba(45, 212, 191, 0.25)",
      accent: "#2dd4bf",
      textPrimary: "#eef7f8",
      textMuted: "rgba(238, 247, 248, 0.45)",
    },
    slate: {
      canvasBg: "linear-gradient(135deg, #111827 0%, #172033 50%, #1e293b 100%)",
      headerBg: "#101827",
      headerBorder: "#334155",
      sidebarBg: "#172235",
      sidebarBorder: "#334155",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      cardSecondaryBg: "#172235",
      cardSecondaryBorder: "#2e3d52",
      navActive: "#38bdf8",
      navItem: "rgba(56, 189, 248, 0.25)",
      accent: "#38bdf8",
      textPrimary: "#f8fafc",
      textMuted: "rgba(248, 250, 252, 0.45)",
    },
    dawn: {
      canvasBg: "linear-gradient(135deg, #101827 0%, #171d33 50%, #20243d 100%)",
      headerBg: "#12162a",
      headerBorder: "rgba(192, 132, 252, 0.22)",
      sidebarBg: "#191c36",
      sidebarBorder: "rgba(192, 132, 252, 0.22)",
      cardBg: "#202542",
      cardBorder: "rgba(192, 132, 252, 0.25)",
      cardSecondaryBg: "#191c36",
      cardSecondaryBorder: "rgba(192, 132, 252, 0.18)",
      navActive: "#c084fc",
      navItem: "rgba(192, 132, 252, 0.25)",
      accent: "#c084fc",
      textPrimary: "#f5f3ff",
      textMuted: "rgba(245, 243, 255, 0.45)",
    },
    blush: {
      canvasBg: "linear-gradient(135deg, #181122 0%, #221528 50%, #2b1830 100%)",
      headerBg: "#181122",
      headerBorder: "rgba(244, 114, 182, 0.22)",
      sidebarBg: "#23172a",
      sidebarBorder: "rgba(244, 114, 182, 0.22)",
      cardBg: "#2b1b33",
      cardBorder: "rgba(244, 114, 182, 0.25)",
      cardSecondaryBg: "#23172a",
      cardSecondaryBorder: "rgba(244, 114, 182, 0.18)",
      navActive: "#f472b6",
      navItem: "rgba(244, 114, 182, 0.25)",
      accent: "#f472b6",
      textPrimary: "#fdf2f8",
      textMuted: "rgba(253, 242, 248, 0.45)",
    },
  },
};

const ThemePreviewMockup: FC<{ palette: ThemePreviewPalette; isSelected: boolean }> = ({ palette, isSelected }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: 60,
        background: palette.canvasBg,
        position: "relative",
        overflow: "hidden",
        borderTopLeftRadius: "9px",
        borderTopRightRadius: "9px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Mini App Header */}
      <Box
        sx={{
          height: 12,
          background: palette.headerBg,
          borderBottom: "1px solid",
          borderColor: palette.headerBorder,
          display: "flex",
          alignItems: "center",
          px: 0.75,
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: palette.accent }} />
        <Box sx={{ width: 18, height: 2.5, borderRadius: 0.5, bgcolor: palette.navItem }} />
        <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: palette.accent }} />
      </Box>

      {/* Mini Body: Sidebar + Main Content */}
      <Box sx={{ flex: 1, display: "flex", p: 0.6, gap: 0.6, overflow: "hidden" }}>
        {/* Mini Sidebar */}
        <Box
          sx={{
            width: 26,
            height: "100%",
            borderRadius: "4px",
            background: palette.sidebarBg,
            border: "1px solid",
            borderColor: palette.sidebarBorder,
            p: 0.4,
            display: "flex",
            flexDirection: "column",
            gap: 0.4,
            flexShrink: 0,
          }}
        >
          <Box sx={{ width: "100%", height: 3, borderRadius: 0.5, bgcolor: palette.navActive }} />
          <Box sx={{ width: "80%", height: 2.5, borderRadius: 0.5, bgcolor: palette.navItem }} />
          <Box sx={{ width: "65%", height: 2.5, borderRadius: 0.5, bgcolor: palette.navItem }} />
        </Box>

        {/* Mini Canvas Content */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.4, minWidth: 0 }}>
          {/* Main Card */}
          <Box
            sx={{
              flex: 1,
              borderRadius: "4px",
              background: palette.cardBg,
              border: "1px solid",
              borderColor: palette.cardBorder,
              p: 0.4,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "3px",
                bgcolor: palette.accent,
                opacity: 0.9,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.3, minWidth: 0 }}>
              <Box sx={{ width: "70%", height: 3, borderRadius: 0.5, bgcolor: palette.textPrimary }} />
              <Box sx={{ width: "45%", height: 2, borderRadius: 0.5, bgcolor: palette.textMuted }} />
            </Box>
          </Box>

          {/* Secondary subtle bar */}
          <Box
            sx={{
              height: 10,
              borderRadius: "3px",
              background: palette.cardSecondaryBg,
              border: "1px solid",
              borderColor: palette.cardSecondaryBorder,
              display: "flex",
              alignItems: "center",
              px: 0.5,
            }}
          >
            <Box sx={{ width: "40%", height: 2, borderRadius: 0.5, bgcolor: palette.textMuted }} />
          </Box>
        </Box>
      </Box>

      {/* Selected Indicator Badge (Upper right corner) */}
      {isSelected && (
        <Box
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 17,
            height: 17,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            zIndex: 1,
          }}
        >
          <CheckRounded sx={{ fontSize: 12, stroke: "currentColor", strokeWidth: 1 }} />
        </Box>
      )}
    </Box>
  );
};

type AppStylePickerProps = {
  sx?: SxProps<Theme>;
};

const AppStylePicker: FC<AppStylePickerProps> = ({ sx }) => {
  const { theme: companyTheme, setTheme: setCompanyTheme } = useCompanyTheme();
  const { style: personalStyle, setStyle: setPersonalStyle, clearStyle: clearPersonalStyle, hasStoredStyle } = useAppStyle();
  const currentUser = useAppSelector((state) => state.user.userData);
  const { formatMessage: i } = useIntl();
  const isDark = useIsDark();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);

  const activeStyle = hasStoredStyle ? personalStyle : companyTheme;

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const canEditCompanyTheme =
    currentUser?.roleType === Roles.Administrator ||
    hasModuleFeaturePermission(ModulesName.CareerProfile, Permission.Edit, currentUser?.modulePermission ?? []);

  const selectPersonalTheme = (theme: AppStyle) => {
    setPersonalStyle(theme);
  };

  const handleResetToCompanyDefault = () => {
    clearPersonalStyle();
    toast.info("Reverted to company default theme.");
  };

  const handleApplyCompanyTheme = async (theme: AppStyle) => {
    setIsUpdatingCompany(true);
    try {
      const { data } = await putRequest<{ appTheme: AppStyle }, { success: boolean; message?: string }>(
        "api/CareerProfile/theme",
        { appTheme: theme },
      );
      if (!data.success) throw new Error(data.message || "Unable to update company theme.");
      setCompanyTheme(theme);
      toast.success("Updated company default theme.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update company theme.");
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const tooltipLabel = i({ id: "APP_STYLE.PICKER", defaultMessage: "Theme & appearance" });

  return (
    <>
      <Tooltip title={tooltipLabel}>
        <AppIconButton
          onClick={handleOpen}
          sx={[
            { border: 0, p: 0 },
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
          role="button"
          aria-label="choose app style"
        >
          <Palette className="fs-32" />
        </AppIconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 3.5,
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 20px 48px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.15)",
              mt: 1.2,
              maxHeight: "calc(100vh - 80px)",
              overflowY: "auto",
              backdropFilter: "blur(20px)",
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ pb: 1.5, mb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Palette sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "13.5px", lineHeight: 1.2 }}>
                  Workspace Theme
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px" }}>
                  {hasStoredStyle ? "Personal preference override" : "Inheriting company default"}
                </Typography>
              </Box>
            </Stack>
            {hasStoredStyle ? (
              <Tooltip title="Personal preference active for your browser session">
                <Chip
                  size="small"
                  label="Personal"
                  color="primary"
                  variant="filled"
                  sx={{ height: 20, fontSize: "10px", fontWeight: 700 }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Using current organization default">
                <Chip
                  size="small"
                  label="Default"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* 2x2 Grid of Theme Preview Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1.25,
          }}
        >
          {APP_STYLES.map((s) => {
            const isSelected = s.value === activeStyle;
            const isCompanyDefault = s.value === companyTheme;
            const palette = PREVIEW_PALETTES[isDark ? "dark" : "light"][s.value];

            return (
              <Box
                key={s.value}
                onClick={() => selectPersonalTheme(s.value)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectPersonalTheme(s.value);
                  }
                }}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  border: "2px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: "background.paper",
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(11, 92, 171, 0.18), 0 4px 12px rgba(0,0,0,0.06)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.18s cubic-bezier(0.2, 0, 0, 1)",
                  position: "relative",
                  outline: "none",
                  "&:hover": {
                    borderColor: isSelected ? "primary.main" : "text.secondary",
                    transform: "translateY(-1.5px)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(11, 92, 171, 0.25), 0 8px 18px rgba(0,0,0,0.09)"
                      : "0 4px 12px rgba(0,0,0,0.06)",
                  },
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 2,
                  },
                }}
              >
                <ThemePreviewMockup palette={palette} isSelected={isSelected} />

                <Box sx={{ p: 1, pt: 0.75 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: "12.5px",
                        lineHeight: 1.2,
                        color: isSelected ? "primary.main" : "text.primary",
                      }}
                    >
                      {s.label}
                    </Typography>
                    {isCompanyDefault && (
                      <Chip
                        size="small"
                        label="Default"
                        sx={{
                          height: 18,
                          fontSize: "9.5px",
                          fontWeight: 700,
                          bgcolor: isDark ? "rgba(255,255,255,0.08)" : "action.hover",
                          color: "text.secondary",
                          px: 0.25,
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: "10px",
                      mt: 0.25,
                      lineHeight: 1.2,
                    }}
                  >
                    {s.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* User Override Reset Action */}
        {hasStoredStyle && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mt: 1.5,
              pt: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px" }}>
              Custom theme active
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<RestartAltRounded sx={{ fontSize: 15 }} />}
              onClick={handleResetToCompanyDefault}
              sx={{
                textTransform: "none",
                fontSize: "11.5px",
                fontWeight: 600,
                py: 0.25,
                px: 1,
                color: "text.secondary",
                "&:hover": { color: "primary.main", bgcolor: "action.hover" },
              }}
            >
              Reset to default
            </Button>
          </Stack>
        )}

        {/* Admin Company Default Control */}
        {canEditCompanyTheme && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.03)" : "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mr: 1 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1.2,
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <BusinessRounded sx={{ fontSize: 15 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "11px",
                      display: "block",
                      lineHeight: 1.2,
                      color: "text.primary",
                    }}
                  >
                    Company Default
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "10.5px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                    }}
                  >
                    Current: <strong>{APP_STYLES.find((x) => x.value === companyTheme)?.label || companyTheme}</strong>
                  </Typography>
                </Box>
              </Stack>

              {activeStyle !== companyTheme ? (
                <Button
                  size="small"
                  variant="contained"
                  disabled={isUpdatingCompany}
                  onClick={() => void handleApplyCompanyTheme(activeStyle)}
                  sx={{
                    textTransform: "none",
                    fontSize: "11px",
                    fontWeight: 700,
                    py: 0.4,
                    px: 1.25,
                    borderRadius: 1.5,
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {isUpdatingCompany ? "Saving..." : `Set "${APP_STYLES.find((x) => x.value === activeStyle)?.label}"`}
                </Button>
              ) : (
                <Chip
                  size="small"
                  icon={<CheckRounded sx={{ fontSize: "13px !important" }} />}
                  label="Synced"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "success.main",
                    borderColor: "success.light",
                    bgcolor: "background.paper",
                    flexShrink: 0,
                  }}
                />
              )}
            </Stack>
          </Box>
        )}
      </Popover>
    </>
  );
};

export { AppStylePicker };
