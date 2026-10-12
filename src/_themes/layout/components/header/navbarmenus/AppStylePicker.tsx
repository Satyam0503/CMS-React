import { FC, MouseEvent, useState } from "react";
import { Box, Popover, Stack, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import { Palette } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { APP_STYLES, AppStyle } from "../../../../../app/modules/theme/useAppStyle";
import { useCompanyTheme } from "../../../../../app/modules/theme/companyTheme";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { putRequest } from "../../../../../server/axios";
import { toast } from "react-toastify";

import { AppIconButton } from "../../../../../app/shared/components/ui";

const SWATCH_BG: Record<AppStyle, string> = {
  glass: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
  slate: "linear-gradient(135deg, #f8fafc 0%, #dce4ed 55%, #cbd5e1 100%)",
  dawn: "linear-gradient(118deg, #ddc6eb 0%, #faf7fc 48%, #f9d7e5 100%)",
  blush: "linear-gradient(135deg, #f3dbe8 0%, #fffafb 52%, #f7dce9 100%)",
};

type AppStylePickerProps = {
  sx?: SxProps<Theme>;
};

const AppStylePicker: FC<AppStylePickerProps> = ({ sx }) => {
  const { theme: style, setTheme } = useCompanyTheme();
  const currentUser = useAppSelector((state) => state.user.userData);
  const { formatMessage: i } = useIntl();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const canEditCompanyTheme = currentUser?.roleType === Roles.Administrator ||
    hasModuleFeaturePermission(ModulesName.CareerProfile, Permission.Edit, currentUser?.modulePermission ?? []);

  if (!canEditCompanyTheme) return null;

  const selectTheme = async (theme: AppStyle) => {
    try {
      const { data } = await putRequest<{ appTheme: AppStyle }, { success: boolean; message?: string }>("api/CareerProfile/theme", { appTheme: theme });
      if (!data.success) throw new Error(data.message || "Unable to update company theme.");
      setTheme(theme);
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update company theme.");
    }
  };

  // Defaults to the literal label so the picker still works if no translation
  // key is present yet — translators can add APP_STYLE.PICKER later.
  const tooltipLabel = i({ id: "APP_STYLE.PICKER", defaultMessage: "App style" });

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
              minWidth: 260,
              borderRadius: 2,
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              mt: 1,
              maxHeight: "calc(100vh - 96px)",
              overflowY: "auto",
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          {tooltipLabel}
        </Typography>
        <Stack spacing={1}>
          {APP_STYLES.map((s) => {
            const isActive = s.value === style;
            return (
              <Stack
                key={s.value}
                direction="row"
                spacing={1.5}
                alignItems="center"
                onClick={() => {
                  void selectTheme(s.value);
                }}
                sx={{
                  cursor: "pointer",
                  p: 1,
                  borderRadius: 1.5,
                  border: "2px solid",
                  borderColor: isActive ? "primary.main" : "transparent",
                  backgroundColor: isActive ? "action.selected" : "transparent",
                  transition: "border-color 120ms, background-color 120ms",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    background: SWATCH_BG[s.value],
                    border: "1px solid rgba(0,0,0,0.08)",
                    flexShrink: 0,
                    backdropFilter: s.value === "glass" ? "blur(6px)" : undefined,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {s.description}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Popover>
    </>
  );
};

export { AppStylePicker };
