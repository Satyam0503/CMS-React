import {
  FC,
  useState,
  MouseEvent } from "react";
import { Box,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Palette } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { APP_STYLES, AppStyle, useAppStyle } from "../../../../../app/modules/theme/useAppStyle";

import { AppIconButton } from "../../../../../app/shared/components/ui";
// Visual preview of each style — shown as a small swatch in the picker.
const SWATCH_BG: Record<AppStyle, string> = {
  cobalt:   "linear-gradient(180deg, #1e3a8a 0%, #2563eb 100%)",
  classic:  "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
  glass:    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
  gradient: "linear-gradient(180deg, #7c3aed 0%, #ec4899 100%)",
  minimal:  "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
  aurora:   "linear-gradient(135deg, #0f766e 0%, #7c3aed 100%)",
  sunset:   "linear-gradient(135deg, #7c2d5c 0%, #fb923c 100%)",
  executive:"linear-gradient(135deg, #111827 0%, #4338ca 100%)",
};

const AppStylePicker: FC = () => {
  const { style, setStyle } = useAppStyle();
  const { formatMessage: i } = useIntl();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // Defaults to the literal label so the picker still works if no translation
  // key is present yet — translators can add APP_STYLE.PICKER later.
  const tooltipLabel = i({ id: "APP_STYLE.PICKER", defaultMessage: "App style" });

  return (
    <>
      <Tooltip title={tooltipLabel}>
        <AppIconButton
          onClick={handleOpen}
          sx={{ border: 0, p: 0 }}
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
                  setStyle(s.value);
                  handleClose();
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
