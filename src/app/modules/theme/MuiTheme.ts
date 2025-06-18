import { createTheme, PaletteMode } from "@mui/material";

export const colors = {
  primary: {
    200: "#E6D9F5",
    300: "#C0A4EB",
    400: "#AC89E6",
    500: "#9A56D3",
    600: "#8B4CBB",
    700: "#7C41A3",
    800: "#6D378B",
    900: "#5E2D73",
    100: "#E6D9F5",
  },
  secondary: {
    200: "#FFE2B8",
    300: "#FFD090",
    400: "#FFBE78",
    500: "#FEBB68",
    600: "#E5A359",
    700: "#CC8C4A",
    800: "#B3743B",
    900: "#995D2D",
    100: "#FFF3E0",
  },
  neutral: {
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    100: "#F5F5F5",
  },
  white: "#ffffff",
};

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter?: string;
  }

  interface TypeBackground {
    header?: string;
    body?: string;
    card?: string;
    box?: string;
    sidebar?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      lighter: colors.primary[200],
      light: colors.primary[300],
      main: colors.primary[500],
      dark: colors.primary[600],
    },
    secondary: {
      lighter: colors.secondary[200],
      light: colors.secondary[300],
      main: colors.secondary[500],
      dark: colors.secondary[700],
    },
    ...(mode === "light"
      ? {
          background: {
            body: "#f5f5f5",
            header: "#ffffff",
            card: "#ffffff",
            sidebar: "#0D0E12",
          },
          divider: colors.neutral[300],
        }
      : {
          background: {
            body: "#121212",
            header: "#1e1e1e",
            card: "#1e1e1e",
            sidebar: "#0D0E12",
          },
        }),
  },
});

export const createApplicationTheme = (mode: PaletteMode) => {
  const theme = createTheme(getDesignTokens(mode));
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
            fontSize: 10,
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          // iconOutlined: {
          //   color: colors.neutral[400],
          // },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            paddingBlock: ".5rem",
            paddingInline: "1rem",
          },
          root: {
            padding: 0,
            "& input:-webkit-autofill": {
              backgroundColor: "transparent", // Removes autofill background
              WebkitBoxShadow: "0 0 0 1000px transparent inset", // Ensures no background shadow
              WebkitTextFillColor: theme.palette.text.secondary, // Optionally set text color
            },
            "&:hover:not(.Mui-focused)": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.text.disabled,
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: 14,
          },
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: theme.palette.text.primary,
            padding: "5px",
          },
        },
      },

      MuiCardHeader: {
        styleOverrides: {
          action: {
            marginTop: -5,
            marginBottom: -5,
            paddingTop: 15,
          },
          title: {
            fontSize: 15,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.card,
            fontSize: "12px",
            boxShadow:
              "0px 1px 3px 0px rgba(0, 0, 0, .1), 0px 1px 2px -1px rgba(0, 0, 0, .1)",
          },
        },
      },

      MuiChip: {
        defaultProps: {
          color: "primary",
        },
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontSize: "12px",
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: 14,
            fontWeight: "bold",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            padding: ".25rem 1rem",
            textTransform: "capitalize",
            "&.Mui-disabled": {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.light,
            },
          },
        },
      },

      MuiIconButton: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: 4,
            marginInline: 0,
            border: "1px solid " + theme.palette.grey[500],
            "&:hover": {
              color: theme.palette.primary.dark,
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
              color: theme.palette.common.white,
              background: theme.palette.primary.main,
            },
            "&:hover": {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.main,
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.main,
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
              fontSize: 12,
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
            fontSize: 12,
          },
          root: {
            "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
              padding: 4,
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
              padding: 4,
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
          },
          head: {
            textTransform: "none",
            fontSize: 12,
            fontWeight: "bolder",
            backgroundColor: "transparent",
            borderBottom: "2px solid" + theme.palette.grey[400],
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "16px",
            "@media (min-width:600px)": {
              padding: "24px",
            },
            "@media (min-width:900px)": {
              padding: "32px",
            },
            "@media (min-width:1280px)": {
              padding: "40px",
            },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            maxWidth: "720px",
            // width:"720px",
            minWidth: "300px", // Default min-width for small screens
            "@media (min-width:600px)": {
              minWidth: "400px", // For small and up screens
            },
            "@media (min-width:900px)": {
              minWidth: "500px", // For medium and up screens
            },
            "@media (min-width:1200px)": {
              minWidth: "600px", // For large screens and up
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
            padding: ".5rem 1rem",
            fontSize: 10,
            backgroundColor: theme.palette.primary.main,
          },
          arrow: {
            color: theme.palette.primary.main,
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
            "& .MuiSwitch-switchBase": {
              padding: 0,
              margin: 2,
              transitionDuration: "300ms",
              "&.Mui-checked": {
                transform: "translateX(16px)",
                color: theme.palette.common.white,
                "& + .MuiSwitch-track": {
                  backgroundColor: theme.palette.primary.main,
                  opacity: 1,
                  border: 0,
                },
                "&.Mui-disabled + .MuiSwitch-track": {
                  opacity: 0.8,
                },
              },
              "&.Mui-focusVisible .MuiSwitch-thumb": {
                color: theme.palette.common.white,
                border: "6px solid" + theme.palette.common.white,
              },
              "&.Mui-disabled .MuiSwitch-thumb": {
                color: theme.palette.common.white,
                backgroundColor: theme.palette.common.white,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.7,
              },
            },
            "& .MuiSwitch-thumb": {
              boxSizing: "border-box",
              width: 22,
              height: 22,
              border: "1px solid " + theme.palette.common.white,
              color: theme.palette.common.white,
            },
            "& .MuiSwitch-track": {
              borderRadius: 26 / 2,
              backgroundColor: theme.palette.grey[400],
              opacity: 1,
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
              color: theme.palette.grey[500],
            },
            "& .MuiSvgIcon-root": { fontSize: 20 },
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
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      h1: {
        fontWeight: 600,
        fontSize: 40,
        color: theme.palette.text.primary,
      },
      h2: {
        fontWeight: 500,
        fontSize: 32,
        color: theme.palette.text.primary,
      },
      h3: {
        fontWeight: 600,
        fontSize: 28,
        lineHeight: 1.4,
        color: theme.palette.text.secondary,
      },
      h4: {
        fontWeight: 500,
        fontSize: 24,
        color: theme.palette.text.primary,
      },
      h5: {
        fontWeight: 500,
        fontSize: 20,
        color: theme.palette.primary.main,
      },
      h6: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.palette.text.secondary,
      },
      body1: {
        fontSize: 14,
        fontWeight: 500,
      },
      body2: {
        fontSize: 12,
        color: theme.palette.text.secondary,
      },
      button: {
        fontWeight: 600,
      },
      subtitle1: {
        color: colors.neutral[500],
      },
      subtitle2: {
        color: colors.primary[500],
      },
    },
  });
  return extendedTheme;
};
