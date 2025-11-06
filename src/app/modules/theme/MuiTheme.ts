import { createTheme } from "@mui/material";
import { Localization } from "@mui/material/locale";
import { darkPalette, lightPalette } from "./themePalettes";

export const createApplicationTheme = (locale: Localization) => {
  const theme = createTheme(
    {
      cssVariables: {
        colorSchemeSelector: "class",
      },
      colorSchemes: {
        dark: darkPalette,
        light: lightPalette,
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
            fontSize: 10,
          },
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
              WebkitTextFillColor: theme.vars?.palette.text.secondary, // Optionally set text color
            },
            "&:hover:not(.Mui-focused)": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.vars?.palette.text.secondary,
              },
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.vars?.palette.text.disabled,
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: theme.vars?.palette.text.secondary,
            fontSize: 14,
          },
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: theme.vars?.palette.text.primary,
            padding: "5px",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
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

      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: 12,
            textTransform: "capitalize",
            "&.Mui-disabled": {
              color: theme.vars?.palette.common.white,
              backgroundColor: theme.vars?.palette.primary.light,
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
            border: "1px solid " + theme.vars?.palette.grey[500],
            "&:hover": {
              color: theme.vars?.palette.primary.main,
              borderColor: theme.vars?.palette.primary.main,
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
          },
          head: {
            textTransform: "none",
            fontSize: 12,
            fontWeight: "bolder",
            backgroundColor: "transparent",
            borderBottom: `2px solid ${theme.vars?.palette.grey[400]}`,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            maxWidth: "720px",
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

      MuiCheckbox: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            "&.Mui-disabled": {
              color: theme.vars?.palette.grey[500],
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
  });
  return extendedTheme;
};
