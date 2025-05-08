import { alpha, createTheme, darken } from "@mui/material";

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter?: string;
  }

  interface TypeBackground {
    lightGray?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}

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
  white: {
    200: "#f4f4f4",
    500: "#ffffff",
  },
};

// const theme = createTheme({});

export const MuiTheme = createTheme({
  palette: {
    // mode: "dark",
    primary: {
      lighter: colors.primary[200],
      light: colors.primary[300],
      main: colors.primary[500],
      dark: colors.primary[700],
    },
    secondary: {
      lighter: colors.secondary[200],
      light: colors.secondary[300],
      main: colors.secondary[500],
      dark: colors.secondary[700],
    },
    action: {
      active: colors.neutral[100],
      hover: colors.primary[200],
      hoverOpacity: 0.1,
      selected: colors.neutral[100],
      selectedOpacity: 0.1,
      // disabled: colors.alpha.neutral[500],
      // disabledBackground: colors.alpha.neutral[500],
      // disabledOpacity: 0.38,
      focus: colors.neutral[200],
      focusOpacity: 0.05,
      activatedOpacity: 0.12,
    },
    background: {
      lightGray: colors.white[200],
    },
  },
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
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(darken(colors.neutral[500], 0.4), 0.2),
          // backdropFilter: "blur(2px)",
          opacity: 0,

          "&.MuiBackdrop-invisible": {
            backgroundColor: "transparent",
            // backdropFilter: "blur(2px)",
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          textTransform: "none",
          marginLeft: 8,
          marginRight: 8,
          fontWeight: "bold",
          color: "#d32f2f",
        },
      },
    },
    // MuiBadge: {
    //   styleOverrides: {
    //     badge: {
    //       backgroundColor: colors.primary[500],
    //     },
    //   },
    // },
    //icon of select outlined
    MuiSelect: {
      styleOverrides: {
        iconOutlined: {
          color: colors.neutral[400],
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        // to change height of outlined input
        input: {
          paddingBlock: ".5rem",
          paddingInline: "1rem",
        },
        root: {
          padding: 0,
          "&:hover:not(.Mui-focused)": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00000",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },

    // MuiInputLabel: {
    //   styleOverrides: {
    //     root: {
    //       "&:hover, &.MuiSelected, &.Mui-focused": {
    //         color: colors.alpha.primary[500],
    //       },
    //     },
    //   },
    // },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: colors.neutral[500],
          padding: "5px",
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        colorPrimary: {
          fontWeight: "bold",
          lineHeight: "40px",
          fontSize: 13,
          background: colors.primary[500],
          color: colors.primary[700],
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
    MuiRadio: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
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

          ".MuiChip-deleteIcon": {
            color: colors.primary[500],
            "&:hover": {
              color: colors.primary[500],
            },
          },
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",

          "&.Mui-expanded": {
            margin: 0,
          },
          "&::before": {
            display: "none",
          },
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

    MuiListItemAvatar: {
      styleOverrides: {
        alignItemsFlexStart: {
          marginTop: 0,
        },
      },
    },

    // MuiStack: {
    //   styleOverrides: {
    //     root: {
    //       paddingTop: "0px !important",
    //     },
    //   },
    // },

    MuiPaginationItem: {
      styleOverrides: {
        page: {
          fontSize: 13,
          fontWeight: "bold",
          transition: "all .2s",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
        },
      },
    },

    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
        // color: "primary",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 5,
          marginInline: 0,
          border: " 1px solid " + colors.neutral[200],

          "& .MuiTouchRipple-root": {
            borderRadius: 8,
          },
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            background: "transparent",
            color: colors.primary[500],
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
      },
      styleOverrides: {
        root: {
          transition: "all .2s",

          // "&:hover, &.Mui-selected, &.Mui-selected:hover": {
          //   color: themeColors.white,
          //   background: colors.alpha.primary[500],
          // },
        },
      },
    },

    //MuiNavbar Menu
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 25,
          width: 20,
          padding: 0,
          // color: colors.alpha.secondary[500],
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingInline: "8px",
          borderRadius: "4px",
          paddingBlock: 0,
          "& .MuiTouchRipple-root": {
            opacity: 0.3,
          },
        },
      },
    },
    //Close
    MuiDivider: {
      styleOverrides: {
        root: {
          border: 0,
          height: 1,
        },
        vertical: {
          height: "auto",
          width: 1,

          "&.MuiDivider-flexItem.MuiDivider-fullWidth": {
            height: "auto",
          },
          "&.MuiDivider-absolute.MuiDivider-fullWidth": {
            height: "100%",
          },
        },
        withChildren: {
          "&:before, &:after": {
            border: 0,
          },
        },
        wrapper: {
          // background: themeColors.white,
          fontWeight: "bold",
          height: 24,
          lineHeight: "24px",
          marginTop: -12,
          color: "inherit",
          textTransform: "uppercase",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          // minWidth: "250px",
          maxWidth: "500px",
          boxShadow: `0px 2px 10px 0px ${colors.neutral[300]}`,
        },
      },
    },

    MuiLink: {
      defaultProps: {
        color: colors.primary[500],
        fontWeight: 500,
        fontSize: 12,
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 6,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          "& .MuiSlider-valueLabelCircle, .MuiSlider-valueLabelLabel": {
            transform: "none",
          },
          "& .MuiSlider-valueLabel": {
            borderRadius: 6,
            color: colors.white[500],
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          height: 59,
          minHeight: 59,
        },
        indicator: {
          height: 59,
          minHeight: 59,
          borderRadius: 0,
          // background: themeColors.white,
          color: colors.neutral[800],
        },

        scroller: {
          styleOverrides: {
            overflow: "visible",
          },
        },
        flexContainer: {
          overflow: "visible",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          height: 59,
          minHeight: 59,
          borderRadius: 0,
          transition: "color .2s",
          textTransform: "capitalize",
          // background: themeColors.white,
          fontSize: "1rem",

          "&.MuiButtonBase-root": {
            minWidth: "auto",
            paddingLeft: 20,
            paddingRight: 20,
            marginRight: 4,
            // border: ' 0px 0px 5px 0px solid ' + colors.primary.dark,
          },

          " &:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: colors.primary[500],
            zIndex: 5,
          },
        },
      },
    },

    //dropdown only menuitem
    MuiMenu: {
      styleOverrides: {
        paper: {
          maxHeight: "230px", // it must be 230px , which is suitable for all
        },

        list: {
          "& .MuiMenuItem-root.MuiButtonBase-root": {
            fontSize: 14,
            marginBottom: 2,
            borderRadius: 4,
            transition: "all .2s",
            "& .MuiTouchRipple-root": {
              opacity: 0.2,
            },
            "&.Mui-selected": {
              color: "#000000",
              background: colors.primary[200],
              // "&:hover": {
              //   color: colors.alpha.white[500],
              //   background: colors.alpha.primary[500],
              // },
            },
          },
        },
      },
    },
    //close

    MuiList: {
      styleOverrides: {
        root: {
          "& .MuiListItem-button": {
            "& > .MuiSvgIcon-root": {
              minWidth: 34,
            },
          },

          //Background of list
          "& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root": {
            opacity: 0.5,
            color: colors.primary[800],
            // background: colors.alpha.primary[400],
          },
        },

        padding: {
          padding: "12px",
          "& .MuiListItem-button": {
            borderRadius: 6,
            margin: "1px 0",
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
            padding: 4,
          },
        },
        paper: {
          maxHeight: "200px",
        },
        clearIndicator: {
          border: 0,
          marginRight: 8,
        },
        popupIndicator: {
          color: colors.neutral[500],
          border: 0,
          "&:hover": {
            color: colors.primary[500],
          },
        },
      },
    },

    MuiTablePagination: {
      styleOverrides: {
        root: {
          marginTop: "1rem",
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
            padding: 5,
          },
        },
        select: {
          "&:focus": {
            backgroundColor: "transparent",
          },
        },
        actions: {
          display: "flex",
          gap: ".5rem",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          minHeight: "0 !important",
          padding: "0 !important",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "12px",
        },
        root: {
          transition: "background-color .2s",

          "&.MuiTableRow-hover:hover": {
            backgroundColor: alpha(colors.primary["100"], 0.25),
          },
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
          color: colors.neutral[800],
          borderBottom: "1px solid " + colors.neutral[300],
        },
        // body: {

        //   fontWeight: "bold",
        // },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          lineHeight: 1.5,
          fontSize: 14,
        },
        standardInfo: {
          color: colors.primary[500],
        },
        action: {
          color: colors.neutral[700],
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
        color: "",
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(colors.primary["400"], 0.95),
          padding: ".5rem 1rem",
          fontSize: 13,
        },
        arrow: {
          color: alpha(colors.primary["400"], 0.95),
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
              color: colors.white[500],
              "& + .MuiSwitch-track": {
                backgroundColor: colors.primary[500],
                opacity: 1,
                border: 0,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.8,
              },
            },
            "&.Mui-focusVisible .MuiSwitch-thumb": {
              color: colors.white[500],
              border: "6px solid" + colors.white[500],
            },
            "&.Mui-disabled .MuiSwitch-thumb": {
              color: colors.white[500],
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.7,
            },
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 22,
            height: 22,
            border: "1px solid " + colors.neutral[300],
          },
          "& .MuiSwitch-track": {
            borderRadius: 26 / 2,
            backgroundColor: colors.neutral[300],
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
          color: colors.neutral[200],
          background: "inherit",
          padding: 5,
          "&:hover": {
            background: "none",
          },

          "&.Mui-checked": {
            color: colors.primary[500],
            background: "none",
          },

          "&.Mui-disabled": {
            color: colors.neutral[400],
          },

          "& .MuiSvgIcon-root": { fontSize: 20 },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.MuiStepIcon-completed": {
            color: colors.primary[500],
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
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',

    h1: {
      fontWeight: 600,
      fontSize: 40,
    },
    h2: {
      fontWeight: 500,
      fontSize: 32,
    },
    h3: {
      fontWeight: 600,
      fontSize: 28,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: 24,
      color: colors.neutral[800],
    },
    h5: {
      fontWeight: 500,
      fontSize: 20,
      color: colors.primary[500],
    },
    h6: {
      fontSize: 16,
    },
    body1: {
      fontSize: 14,
      fontWeight: 500,
    },
    body2: {
      fontSize: 12,
      color: colors.neutral[400],
    },
    button: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 12,
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: 10,
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: 10,
      color: colors.neutral[400],
    },
    overline: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: "uppercase",
    },
  },
});
