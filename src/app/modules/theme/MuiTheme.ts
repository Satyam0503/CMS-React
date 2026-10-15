import { createTheme } from "@mui/material";
import { Localization } from "@mui/material/locale";
import { darkPalette, dawnDarkPalette, dawnLightPalette, lightPalette } from "./themePalettes";
import { AppStyle, DEFAULT_THEME } from "./useAppStyle";

// Surface treatment per style — applied to MuiCard / MuiPaper / MuiAppBar.
// Returns CSS-in-JS objects (not full sx). Kept inline for theme integration;
// rules outside MUI live in _app-style.scss keyed off [data-app-style].
const getSurfaceOverrides = (appStyle: AppStyle) => {
  switch (appStyle) {
    case "glass":
      return {
        card: {
          background:
            "var(--app-glass-card-bg, var(--mui-palette-background-card, rgba(255, 255, 255, 0.76)))",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--app-glass-border, var(--mui-palette-divider, rgba(255, 255, 255, 0.88)))",
          boxShadow:
            "var(--app-glass-card-shadow, 0 10px 32px 0 rgba(11, 92, 171, 0.06), 0 2px 8px 0 rgba(15, 23, 42, 0.03))",
        },
        paper: {
          background:
            "var(--app-glass-paper-bg, var(--mui-palette-background-paper, rgba(255, 255, 255, 0.80)))",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--app-glass-border, var(--mui-palette-divider, rgba(255, 255, 255, 0.88)))",
          boxShadow:
            "var(--app-glass-paper-shadow, 0 8px 26px -4px rgba(11, 92, 171, 0.06))",
        },
      };
    case "slate":
      return {
        card: {
          background:
            "var(--app-slate-surface, var(--mui-palette-background-card, linear-gradient(135deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0.74) 100%)))",
          WebkitBackdropFilter: "blur(24px) saturate(185%)",
          backdropFilter: "blur(24px) saturate(185%)",
          borderRadius: 16,
          border: "1px solid var(--app-slate-border, var(--mui-palette-divider, rgba(255, 255, 255, 0.90)))",
          boxShadow:
            "var(--app-slate-card-shadow, 0 14px 36px -6px rgba(15, 23, 42, 0.08), 0 4px 14px -2px rgba(79, 70, 229, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.96))",
        },
        paper: {
          background:
            "var(--app-slate-surface, var(--mui-palette-background-paper, linear-gradient(135deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0.76) 100%)))",
          WebkitBackdropFilter: "blur(22px) saturate(180%)",
          backdropFilter: "blur(22px) saturate(180%)",
          borderRadius: 14,
          border: "1px solid var(--app-slate-border-soft, var(--mui-palette-divider, rgba(255, 255, 255, 0.88)))",
          boxShadow: "var(--app-slate-paper-shadow, 0 10px 28px -4px rgba(15, 23, 42, 0.07), inset 0 1px 1px 0 rgba(255, 255, 255, 0.94))",
        },
      };
    case "dawn":
      return {
        card: {
          background: "var(--app-dawn-card-background, var(--mui-palette-background-card, linear-gradient(135deg, rgba(255, 255, 255, 0.66) 0%, rgba(250, 244, 253, 0.44) 100%)))",
          WebkitBackdropFilter: "blur(24px) saturate(185%)",
          backdropFilter: "blur(24px) saturate(185%)",
          borderRadius: 16,
          border: "1px solid var(--app-dawn-border, var(--mui-palette-divider, rgba(255, 255, 255, 0.78)))",
          boxShadow: "var(--app-dawn-card-shadow, 0 14px 36px rgba(73, 59, 89, 0.09), inset 0 1px 1px rgba(255, 255, 255, 0.90))",
        },
        paper: {
          background: "var(--app-dawn-surface, var(--mui-palette-background-paper, linear-gradient(135deg, rgba(255, 255, 255, 0.64) 0%, rgba(250, 244, 253, 0.46) 100%)))",
          WebkitBackdropFilter: "blur(22px) saturate(180%)",
          backdropFilter: "blur(22px) saturate(180%)",
          borderRadius: 14,
          border: "1px solid var(--app-dawn-border-soft, var(--mui-palette-divider, rgba(255, 255, 255, 0.74)))",
          boxShadow: "var(--app-dawn-paper-shadow, 0 10px 28px rgba(73, 59, 89, 0.07), inset 0 1px 1px rgba(255, 255, 255, 0.86))",
        },
      };
    case "blush":
      return {
        card: {
          background: "var(--app-blush-surface, var(--mui-palette-background-card, linear-gradient(135deg, rgba(255, 255, 255, 0.66) 0%, rgba(255, 248, 251, 0.44) 100%)))",
          WebkitBackdropFilter: "blur(24px) saturate(185%)",
          backdropFilter: "blur(24px) saturate(185%)",
          borderRadius: 16,
          border: "1px solid var(--app-blush-border, var(--mui-palette-divider, rgba(255, 255, 255, 0.78)))",
          boxShadow: "var(--app-blush-card-shadow, 0 14px 36px rgba(150, 82, 120, 0.09), inset 0 1px 1px rgba(255, 255, 255, 0.90))",
        },
        paper: {
          background: "var(--app-blush-surface, var(--mui-palette-background-paper, linear-gradient(135deg, rgba(255, 255, 255, 0.64) 0%, rgba(255, 248, 251, 0.46) 100%)))",
          WebkitBackdropFilter: "blur(22px) saturate(180%)",
          backdropFilter: "blur(22px) saturate(180%)",
          borderRadius: 14,
          border: "1px solid var(--app-blush-border-soft, var(--mui-palette-divider, rgba(255, 255, 255, 0.74)))",
          boxShadow: "var(--app-blush-paper-shadow, 0 10px 28px rgba(150, 82, 120, 0.07), inset 0 1px 1px rgba(255, 255, 255, 0.86))",
        },
      };
    default:
      return { card: {}, paper: {} };
  }
};

export const createApplicationTheme = (locale: Localization, appStyle: AppStyle = DEFAULT_THEME) => {
  const surface = getSurfaceOverrides(appStyle);
  const pageRadius = 16;
  const theme = createTheme(
    {
      cssVariables: {
        colorSchemeSelector: "class",
      },
      colorSchemes: {
        dark: appStyle === "dawn" || appStyle === "blush" ? dawnDarkPalette : darkPalette,
        light: appStyle === "dawn" || appStyle === "blush" ? dawnLightPalette : lightPalette,
      },
    },
    locale
  );

  const extendedTheme = createTheme(theme, {
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1840,
      },
    },
    components: {
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            textTransform: "none",
            marginLeft: 8,
            marginRight: 8,
            fontSize: 11,
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            paddingBlock: ".55rem",
            paddingInline: ".9rem",
            fontSize: "13.5px",
            color: "inherit",
            "&.Mui-disabled": {
              WebkitTextFillColor: "var(--mui-palette-text-disabled, #64748B)",
              color: "var(--mui-palette-text-disabled, #64748B)",
              fontWeight: 500,
              opacity: 0.8,
            },
          },
          root: {
            padding: 0,
            borderRadius: 10,
            backgroundColor: "var(--mui-palette-background-box, #F8FAFC)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            "&.Mui-disabled": {
              backgroundColor: "color-mix(in srgb, var(--mui-palette-action-disabledBackground, rgba(241, 245, 249, 0.90)) 70%, transparent)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--mui-palette-divider, rgba(148, 163, 184, 0.65))",
              },
            },
            "& input:-webkit-autofill": {
              backgroundColor: "transparent",
              WebkitBoxShadow: "0 0 0 1000px transparent inset",
              WebkitTextFillColor: theme.vars?.palette.text.primary,
            },
            "&:hover:not(.Mui-focused)": {
              backgroundColor: "var(--mui-palette-background-paper, #FFFFFF)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--mui-palette-primary-main, #64748B)",
              },
            },
            "&.Mui-focused": {
              backgroundColor: "var(--mui-palette-background-paper, #FFFFFF)",
              boxShadow: "0 0 0 3px color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1.5px",
                borderColor: theme.vars?.palette.primary.main,
              },
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--mui-palette-divider, #CBD5E1)",
              transition: "border-color 0.2s ease",
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: theme.vars?.palette.text.secondary,
            fontSize: 13.5,
            fontWeight: 600,
            "&.Mui-disabled": {
              color: "var(--mui-palette-text-disabled, #64748B)",
              fontWeight: 500,
            },
          },
        },
      },

      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            gap: "10px",
            "& .MuiSwitch-root": {
              marginRight: "6px",
            },
          },
          label: {
            fontSize: "13.5px",
            fontWeight: 500,
            userSelect: "none",
            "&.Mui-disabled": {
              color: "var(--mui-palette-text-disabled, #64748B)",
              WebkitTextFillColor: "var(--mui-palette-text-disabled, #64748B)",
              fontWeight: 500,
            },
          },
        },
      },

      MuiCheckbox: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            "&.Mui-disabled": {
              color: "#94A3B8",
              "&.Mui-checked": {
                color: "rgba(79, 70, 229, 0.82)",
              },
            },
            "& .MuiSvgIcon-root": { fontSize: 20 },
          },
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: theme.vars?.palette.text.secondary,
            padding: "5px",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            fontSize: "13.5px",
            ...surface.card,
            borderRadius: `${pageRadius}px !important`,
            border: surface.card.border ?? "1px solid var(--mui-palette-divider)",
            boxShadow:
              surface.card.boxShadow ??
              "0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
            transition:
              "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            ...surface.paper,
            borderRadius: `${pageRadius}px !important`,
          },
        },
      },

      MuiChip: {
        defaultProps: {
          color: "primary",
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            backdropFilter: "blur(8px)",
          },
          outlined: {
            backgroundColor: "color-mix(in srgb, var(--mui-palette-background-paper) 75%, transparent)",
            borderColor: "color-mix(in srgb, var(--mui-palette-primary-main) 24%, var(--mui-palette-divider))",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            borderRadius: 10,
            textTransform: "none",
            paddingInline: "16px",
            transition:
              "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.18s ease, border-color 0.18s ease",
            "&:active:not(.Mui-disabled)": {
              transform: "translateY(0) scale(0.985)",
            },
            "&.Mui-disabled": {
              color: theme.vars?.palette.text.disabled,
              backgroundColor: theme.vars?.palette.action.disabledBackground,
              borderColor: theme.vars?.palette.divider,
              boxShadow: "none",
            },
          },
          containedPrimary: {
            background:
              "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
            boxShadow:
              "0 6px 16px -3px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)",
            "&:hover": {
              background:
                "linear-gradient(135deg, var(--mui-palette-primary-main) 15%, var(--mui-palette-primary-dark) 100%)",
              boxShadow:
                "0 10px 22px -3px color-mix(in srgb, var(--mui-palette-primary-main) 45%, transparent), inset 0 1px 0 0 rgba(255, 255, 255, 0.28)",
              transform: "translateY(-1px)",
            },
          },
          outlined: {
            backgroundColor: "color-mix(in srgb, var(--mui-palette-background-paper) 78%, transparent)",
            backdropFilter: "blur(8px)",
            borderColor: "color-mix(in srgb, var(--mui-palette-primary-main) 28%, var(--mui-palette-divider))",
            "&:hover": {
              backgroundColor: "color-mix(in srgb, var(--mui-palette-primary-main) 7%, var(--mui-palette-background-paper))",
              borderColor: theme.vars?.palette.primary.main,
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: 6,
            marginInline: 0,
            border: "1px solid transparent",
            transition: "color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease",
            "&:hover": {
              color: theme.vars?.palette.primary.main,
              backgroundColor: theme.vars?.palette.action.hover,
            },
          },
          sizeSmall: {
            padding: 4,
          },
        },
      },

      MuiToggleButton: {
        defaultProps: {
          disableRipple: true,
          color: "primary",
        },
        styleOverrides: {
          root: {
            transition: "all .2s",
            "&.Mui-selected, &.Mui-selected:hover": {
              color: theme.vars?.palette.common.white,
              background: theme.vars?.palette.primary.main,
            },
            "&:hover": {
              color: theme.vars?.palette.common.white,
              backgroundColor: theme.vars?.palette.primary.main,
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: theme.vars?.palette.primary.main,
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "inherit",
            minWidth: 25,
            width: 20,
            padding: 0,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            paddingInline: 16,
            borderRadius: 4,
            paddingBlock: 0,
            "& .MuiTouchRipple-root": {
              opacity: 0.3,
            },
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          list: {
            "& .MuiMenuItem-root.MuiButtonBase-root": {
              marginBottom: 2,
              borderRadius: 4,
              fontSize: 13,
            },
          },
        },
      },

      MuiList: {
        styleOverrides: {
          root: {
            "& .MuiListItem-button": {
              "& > .MuiSvgIcon-root": {
                minWidth: 32,
              },
            },
          },

          padding: {
            padding: "12px",
            "& .MuiListItem-button": {
              borderRadius: 4,
            },
          },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          option: {
            marginBlockEnd: 2,
            fontSize: 13,
          },
          root: {
            "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
              padding: 5,
            },
          },
          clearIndicator: {
            border: 0,
            marginRight: 8,
          },
          popupIndicator: {
            border: 0,
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: {
            "& .MuiTablePagination-selectLabel": {
              margin: "0px",
              fontSize: "14px",
            },
            "& .MuiTablePagination-displayedRows": {
              marginBottom: "0px",
              fontSize: "14px",
            },
          },
          toolbar: {
            "& .MuiIconButton-root": {
              padding: 2,
              fontSize: 12,
            },
          },
          select: {
            "&:focus": {
              backgroundColor: "transparent",
            },
          },
          actions: {
            display: "flex",
            gap: 4,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            border: 0,
            fontSize: 13.5,
          },
          head: {
            textTransform: "none",
            fontSize: 13,
            fontWeight: 700,
            backgroundColor: "transparent",
            color: theme.vars?.palette.text.primary,
            borderBottom: "1px solid var(--mui-palette-divider)",
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          slotProps: {
            backdrop: {
              sx: {
                backgroundColor: "rgba(15, 23, 42, 0.48)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              },
            },
          },
        },
        styleOverrides: {
          paper: {
            margin: "16px",
            width: "calc(100% - 32px)",
            "@media (max-width:599px)": {
              margin: "12px",
              width: "calc(100% - 24px)",
            },
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: "24px !important",
            "@media (max-width:599px)": {
              paddingTop: "16px !important",
            },
          },
        },
      },

      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
        styleOverrides: {
          tooltip: {
            padding: ".5rem .85rem",
            fontSize: 12,
            backgroundColor: theme.vars?.palette.primary.main,
          },
          arrow: {
            color: theme.vars?.palette.primary.main,
          },
        },
      },

      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: "1280px",
            padding: "1rem",

            "@media (min-width:600px)": {
              padding: "1.5rem",
            },
            // "@media (min-width:900px)": {
            //   padding: "32px",
            // },
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            marginRight: 10,
            flexShrink: 0,
            "& .MuiSwitch-switchBase": {
              padding: 0,
              margin: 2,
              transitionDuration: "300ms",
              "&.Mui-checked": {
                transform: "translateX(16px)",
                color: theme.vars?.palette.common.white,
                "& + .MuiSwitch-track": {
                  backgroundColor: theme.vars?.palette.primary.main,
                  opacity: 1,
                  border: 0,
                },
                "&.Mui-disabled + .MuiSwitch-track": {
                  opacity: 0.8,
                },
              },
              "&.Mui-focusVisible .MuiSwitch-thumb": {
                color: theme.vars?.palette.common.white,
                border: "6px solid" + theme.vars?.palette.common.white,
              },
              "&.Mui-disabled .MuiSwitch-thumb": {
                color: theme.vars?.palette.common.white,
                backgroundColor: theme.vars?.palette.common.white,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.7,
              },
            },
            "& .MuiSwitch-thumb": {
              boxSizing: "border-box",
              width: 22,
              height: 22,
              border: "1px solid " + theme.vars?.palette.common.white,
              color: theme.vars?.palette.common.white,
            },
            "& .MuiSwitch-track": {
              borderRadius: 26 / 2,
              backgroundColor: theme.vars?.palette.grey[400],
              opacity: 1,
            },
          },
        },
      },

      MuiTypography: {
        styleOverrides: {
          gutterBottom: {
            marginBottom: 4,
          },
          paragraph: {
            fontSize: 17,
            lineHeight: 1.7,
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: 40,
        color: theme.vars?.palette.text.primary,
      },
      h2: {
        fontWeight: 500,
        fontSize: 32,
        color: theme.vars?.palette.text.primary,
      },
      h3: {
        fontWeight: 600,
        fontSize: 28,
        lineHeight: 1.4,
        color: theme.vars?.palette.text.secondary,
      },
      h4: {
        fontWeight: 500,
        fontSize: 24,
        color: theme.vars?.palette.text.primary,
      },
      h5: {
        fontWeight: 500,
        fontSize: 20,
        color: theme.vars?.palette.primary.main,
      },
      h6: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.vars?.palette.text.secondary,
      },
      body1: {
        fontSize: 14,
        color: theme.vars?.palette.text.primary,
      },
      body2: {
        fontSize: 12,
        color: theme.vars?.palette.text.secondary,
      },
      button: {
        fontWeight: 600,
      },
      subtitle1: {
        color: theme.vars?.palette.text.primary,
      },
      subtitle2: {
        color: theme.vars?.palette.primary.main,
      },
    },
    shape: {
      borderRadius: pageRadius,
    },
  });
  return extendedTheme;
};
