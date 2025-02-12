import { alpha, createTheme, lighten, darken } from "@mui/material";

const themeColors = {
  primary: "#9A56D3",
  secondary: "#FEBB68",
  success: "#4CAF50",
  info: "#7F9BFF",
  neutral: "#737373",
  warning: "#FFC107",
  error: "#F44336",
  white: "#ffffff",
  territory: "636D79",
};

export const colors = {
  shadows: {
    medium:
      "0px 1px 4px rgba(85, 105, 255, 0.25), 0px 3px 12px 2px rgba(85, 105, 255, 0.35)",
    card: "rgba(0, 0, 0, 0.04) 0px 3px 5px;",
  },

  layout: {
    general: {
      bodyBg: "#f5f5f5",
    },
    sidebar: {
      background: themeColors.territory,
      textColor: themeColors.white,
      dividerBg: themeColors.neutral,
      menuItemColor: "#242E6F",
      menuItemColorActive: themeColors.secondary,
      menuItemBg: themeColors.white,
      menuItemBgActive: "#f2f5f9",
      menuItemIconColor: lighten(themeColors.secondary, 0.3),
      menuItemIconColorActive: themeColors.secondary,
      menuItemHeadingColor: darken(themeColors.secondary, 0.3),
    },
  },
  alpha: {
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
    success: {
      200: "#C8F2CC",
      300: "#A4EBAB",
      400: "#80E389",
      500: "#4CAF50",
      600: "#439D49",
      700: "#37843C",
      800: "#2A692F",
      900: "#1A4720",
      100: "#ECF9ED",
    },
    info: {
      200: "#DDE6FF",
      300: "#CFD8FF",
      400: "#A9B8FF",
      500: "#7F9BFF",
      600: "#5472FA",
      700: "#3B5BD4",
      800: "#2B46A5",
      900: "#1A3173",
      100: "#F0F4FF",
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
    warning: {
      200: "#FFF2B3",
      300: "#FFE680",
      400: "#FFDA4D",
      500: "#FFC107",
      600: "#FFA000",
      700: "#FF7800",
      800: "#E86005",
      900: "#BA4303",
      100: "#FFFBE6",
    },
    danger: {
      200: "#FFC8C7",
      300: "#FFA4A3",
      400: "#FF8080",
      500: "#F44336",
      600: "#E03131",
      700: "#C62828",
      800: "#A51D1D",
      900: "#7F1212",
      100: "#FFECEB",
    },
    white: {
      200: "#f4f4f4",
      500: "#ffffff",
    },
  },
};

const colorThemeText = {
  heading: colors.alpha.neutral[800],
  secondaryHeading: colors.alpha.primary[500],
  bodyText: colors.alpha.neutral[600],
  linkText: colors.alpha.primary[500],
  sidebarBG: themeColors.territory,
  sidebarText: themeColors.white,
  sidebarLink: colors.alpha.secondary[500],
  bodyBG: colors.alpha.neutral[100],
};
export const MuiTheme = createTheme({
  colors: {
    shadows: {
      medium: colors.shadows.medium,
    },
  },
  general: {
    reactFrameworkColor: "#00D8FF",
    borderRadiusSm: "6px",
    borderRadius: "10px",
    borderRadiusLg: "12px",
    borderRadiusXl: "16px",
  },
  sidebar: {
    background: colors.layout.sidebar.background,
    textColor: colors.layout.sidebar.textColor,
    dividerBg: colors.layout.sidebar.dividerBg,
    menuItemColor: colors.layout.sidebar.menuItemColor,
    menuItemColorActive: colors.layout.sidebar.menuItemColorActive,
    menuItemBg: colors.layout.sidebar.menuItemBg,
    menuItemBgActive: colors.layout.sidebar.menuItemBgActive,
    menuItemIconColor: colors.layout.sidebar.menuItemIconColor,
    menuItemIconColorActive: colors.layout.sidebar.menuItemIconColorActive,
    menuItemHeadingColor: colors.layout.sidebar.menuItemHeadingColor,
    boxShadow:
      "2px 0 3px rgba(159, 162, 191, .18), 1px 0 1px rgba(159, 162, 191, 0.32)",
    width: "290px",
  },

  spacing: 9,
  palette: {
    common: {
      white: themeColors.white,
    },

    /// text of table
    text: {
      primary: colors.alpha.neutral[800],
    },
    background: {
      paper: themeColors.white,
      default: themeColors.white,
    },
    action: {
      active: colors.alpha.neutral[100],
      hover: colors.alpha.primary[100],
      hoverOpacity: 0.1,
      selected: colors.alpha.neutral[100],
      selectedOpacity: 0.1,
      disabled: colors.alpha.neutral[500],
      disabledBackground: colors.alpha.neutral[500],
      disabledOpacity: 0.38,
      focus: colors.alpha.neutral[100],
      focusOpacity: 0.05,
      activatedOpacity: 0.12,
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
          backgroundColor: alpha(darken(colors.alpha.neutral[500], 0.4), 0.2),
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
          color: colors.alpha.danger[800],
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "html, body": {
          width: "100%",
          height: "100%",
        },
        body: {
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
          flex: 1,
        },
        "#root": {
          width: "100%",
          height: "100%",
          display: "flex",
          flex: 1,
          flexDirection: "column",
        },
        html: {
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
          MozOsxFontSmoothing: "grayscale",
          WebkitFontSmoothing: "antialiased",
        },
        ".child-popover .MuiPaper-root .MuiList-root": {
          flexDirection: "column",
        },
        "#nprogress": {
          pointerEvents: "none",
        },
        "#nprogress .bar": {
          background: themeColors.secondary,
        },
        "#nprogress .spinner-icon": {
          borderTopColor: colors.alpha.primary[500],
          borderLeftColor: colors.alpha.primary[500],
        },
        "#nprogress .peg": {
          boxShadow:
            "0 0 15px " +
            colors.alpha.primary[500] +
            ", 0 0 8px" +
            colors.alpha.primary[500],
        },
        ":root": {
          "--swiper-theme-color": colors.alpha.primary[500],
        },
        code: {
          background: colors.alpha.primary[500],
          color: colors.alpha.primary[500],
          borderRadius: 4,
          padding: 4,
        },
        "@keyframes ripple": {
          "0%": {
            transform: "scale(.8)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(2.8)",
            opacity: 0,
          },
        },
        "@keyframes float": {
          "0%": {
            transform: "translate(0%, 0%)",
          },
          "100%": {
            transform: "translate(3%, 3%)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        iconOutlined: {
          color: colors.alpha.white[500],
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: ".8rem",
        },
        root: {
          padding: "0px ",
          "& .MuiInputAdornment-positionEnd.MuiInputAdornment-outlined,": {
            paddingRight: ".5rem",
            borderColor: colors.alpha.primary[500],
          },
          "&:hover, &.MuiOutlinedInput-notchedOutline": {
            border: " none ",
          },
          // "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline, ": {
          //   borderColor: colors.alpha.primary[500],
          // },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.alpha.primary[500],
            },
          },

          "&:hover:not(.Mui-focused)": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.alpha.primary[500],
            },
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: colors.alpha.neutral[500],
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
          background: colors.alpha.primary[500],
          color: colors.alpha.primary[700],
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
      styleOverrides: {
        root: {
          borderRadius: 4,
          background: colors.alpha.primary[100],
          color: colors.alpha.primary[500],
          fontSize: "12px",

          ".MuiChip-deleteIcon": {
            color: colors.alpha.primary[500],
            "&:hover": {
              color: colors.alpha.primary[500],
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
        colorDefault: {
          background: colors.alpha.neutral[300],
          color: themeColors.white,
        },
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: {
          alignItems: "center",
        },
        avatar: {
          background: colors.alpha.neutral[100],
          fontSize: 13,
          color: colors.alpha.neutral[700],
          fontWeight: "bold",

          "&:first-of-type": {
            border: 0,
            background: "transparent",
          },
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

    MuiStack: {
      styleOverrides: {
        root: {
          paddingTop: "0px !important",
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        page: {
          fontSize: 13,
          fontWeight: "bold",
          transition: "all .2s",
        },
        textPrimary: {
          "&.Mui-selected": {
            boxShadow: colors.shadows.medium,
          },
          "&.MuiButtonBase-root:hover": {
            background: colors.alpha.primary[500],
          },
          "&.Mui-selected.MuiButtonBase-root:hover": {
            background: colors.alpha.primary[500],
          },
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          fontWeight: "bold",
          textTransform: "none",
          paddingInline: 16,
          background: colors.alpha.white[500],
          color: colors.alpha.neutral[800],
          border: " 1px solid " + colors.alpha.neutral[200],
          "&:hover, &.MuiSelected": {
            backgroundColor: colors.alpha.neutral[100],
            color: colors.alpha.neutral[800],
            border: "1px solid " + colors.alpha.neutral[200],
          },

          "&.Mui-disabled": {
            backgroundColor: colors.alpha.primary[400],
            color: colors.alpha.white[500],
          },
          ".MuiSvgIcon-root": {
            transition: "all .2s",
          },
        },
        endIcon: {
          marginRight: -8,
        },

        contained: {
          backgroundColor: colors.alpha.primary[500],
          color: colors.alpha.white[500],
          "&:hover, &.MuiSelected": {
            backgroundColor: colors.alpha.primary[800],
            color: colors.alpha.white[500],
          },
        },
        outlined: {
          backgroundColor: colors.alpha.white[500],
          border: " 1px solid " + colors.alpha.neutral[200],

          "&:hover, &.MuiSelected": {
            backgroundColor: colors.alpha.neutral[100],
            color: colors.alpha.neutral[800],
            border: "1px solid " + colors.alpha.neutral[200],
          },
        },
        text: {
          backgroundColor: colors.alpha.white[500],
          border: "none",
          "&:hover, &.MuiSelected": {
            backgroundColor: colors.alpha.primary[500],
            color: colors.alpha.white[500],
            border: "1px solid " + colors.alpha.neutral[200],
          },
        },
        sizeSmall: {
          padding: "6px 16px",
          background: colors.alpha.white[500],
          lineHeight: 1.5,
        },
        sizeMedium: {
          padding: "7px 20px",
          fontWeight: 500,
        },
        sizeLarge: {
          padding: "11px 24px",
          fontWeight: 500,
        },
        textSizeSmall: {
          padding: "7px 12px",
        },
        textSizeMedium: {
          padding: "9px 16px",
          fontSize: 12,
        },
        textSizeLarge: {
          padding: "12px 16px",
          fontSize: 12,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: colors.alpha.white[500],
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          transition: "all .2s",
          borderColor: colors.alpha.neutral[500],

          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: colors.alpha.neutral[500],
          },
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: colors.alpha.primary[500],
          background: themeColors.white,
          transition: "all .2s",

          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: themeColors.white,
            background: colors.alpha.primary[500],
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
          padding: 5,
          marginInline: 0,
          color: colors.alpha.neutral[800],
          border: " 1px solid " + colors.alpha.neutral[200],

          "& .MuiTouchRipple-root": {
            borderRadius: 8,
          },
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            border: " 1px solid " + colors.alpha.neutral[200],
            background: colors.alpha.neutral[100],
            color: colors.alpha.primary[500],
          },
        },
        sizeSmall: {
          padding: 4,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "20px ",
          padding: "0px",
          color: colors.alpha.secondary[500],
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "& .MuiTouchRipple-root": {
            opacity: 0.3,
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          background: colors.alpha.neutral[100],
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
          background: themeColors.white,
          fontWeight: "bold",
          height: 24,
          lineHeight: "24px",
          marginTop: -12,
          color: "inherit",
          textTransform: "uppercase",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 0,
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation: {
          boxShadow: colors.shadows.card,
        },
        elevation2: {
          boxShadow: colors.shadows.card,
        },
        elevation24: {
          boxShadow: colors.shadows.card,
        },
        outlined: {
          boxShadow: colors.shadows.card,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        color: colors.alpha.primary[500],
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
            background: colors.alpha.neutral[100],
            color: colors.alpha.white[500],
          },
        },
      },
    },

    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
          "& .MuiListItem-button": {
            transition: "all .2s",

            "& > .MuiSvgIcon-root": {
              minWidth: 34,
            },

            // "& .MuiTouchRipple-root": {
            //   opacity: 0.2,
            // },
          },
          "&.MuiListItem-root.MuiButtonBase-root.Mui-selected": {
            color: colors.alpha.white[500],
            background: colors.alpha.primary[400],
          },
          "&.MuiMenuItem-root.MuiButtonBase-root:active": {
            color: colors.alpha.white[500],
            background: colors.alpha.primary[400],
          },
          "& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root": {
            opacity: 0.5,
            color: colors.alpha.primary[800],
            background: colors.alpha.primary[400],
          }, //MenuItem
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
          background: themeColors.white,
          color: colors.alpha.neutral[800],
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
          background: themeColors.white,
          fontSize: "1rem",

          "&.MuiButtonBase-root": {
            minWidth: "auto",
            paddingLeft: 20,
            paddingRight: 20,
            marginRight: 4,
            // border: ' 0px 0px 5px 0px solid ' + colors.primary.dark,
          },

          " &:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: colors.alpha.primary[500],
            zIndex: 5,
          },
        },
      },
    },

    //dropdown only menuitem
    MuiMenu: {
      styleOverrides: {
        paper: {
          padding: 0,
          maxHeight: "200px",
        },
        list: {
          padding: 12,
          "& .MuiMenuItem-root.MuiButtonBase-root": {
            fontSize: 14,
            marginTop: 1,
            marginBottom: 2,
            transition: "all .2s",

            "& .MuiTouchRipple-root": {
              opacity: 0.2,
            },

            "&.Mui-selected": {
              color: colors.alpha.white[500], // When selected
              background: colors.alpha.primary[500],
              "&:hover": {
                color: colors.alpha.white[500],
                background: colors.alpha.primary[500],
              },
            },

            "&:active": {
              //on hover
              color: colors.alpha.primary[900],
              background: colors.alpha.primary[300],
            },
          },
        },
      },
    },
    //close
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: "all .2s",
          "&:active": {
            color: colors.alpha.success[500],
            background: colors.alpha.secondary[500],
          },
          "&.Mui-selected:hover": {
            background: colors.alpha.secondary[500],
            color: colors.alpha.success[500],
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&.MuiButtonBase-root": {
            color: colors.alpha.success[500],
            background: colors.alpha.secondary[500],

            "&:hover, &:active, &.active, &.Mui-selected": {
              color: colors.alpha.success[500],
              background: colors.alpha.secondary[500],
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          margin: 1,
        },
        root: {
          ".MuiAutocomplete-inputRoot.MuiOutlinedInput-root .MuiAutocomplete-endAdornment":
            {
              right: 14,
            },
        },
        clearIndicator: {
          background: colors.alpha.primary[500],
          color: colors.alpha.primary[500],
          marginRight: 8,

          "&:hover": {
            background: colors.alpha.primary[500],
            color: colors.alpha.primary[500],
          },
        },
        popupIndicator: {
          color: colors.alpha.neutral[500],

          "&:hover": {
            background: colors.alpha.primary[500],
            color: colors.alpha.primary[500],
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
            padding: 8,
          },
        },
        select: {
          "&:focus": {
            backgroundColor: "transparent",
          },
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
          background: themeColors.white,
          color: colors.alpha.neutral[800],
          fontWeight: 600,
          fontSize: "12px",
        },
        root: {
          transition: "background-color .2s",

          "&.MuiTableRow-hover:hover": {
            backgroundColor: alpha(colors.alpha.primary["100"], 0.25),
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
          color: colors.alpha.neutral[800],
          borderBottom: "1px solid " + colors.alpha.neutral[300],
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
          color: colors.alpha.primary[500],
        },
        action: {
          color: colors.alpha.neutral[700],
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
            padding: "48px",
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
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(colors.alpha.primary["400"], 0.95),
          padding: ".5rem 1rem",
          fontSize: 13,
        },
        arrow: {
          color: alpha(colors.alpha.primary["400"], 0.95),
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
    // MuiSwitch: {
    //   styleOverrides: {
    //     root: {
    //       overflow: "visible",

    //       // "& .MuiButtonBase-root": {
    //       //   position: "absolute",
    //       //   padding: 6,
    //       //   transition:
    //       //     "left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    //       // },
    //       // "& .MuiIconButton-root": {
    //       //   borderRadius: 100,
    //       // },
    //     },
    //     // thumb: {
    //     //   border: "1px solid " + colors.alpha.neutral[300],
    //     // },
    //     // track: {
    //     //   backgroundColor: colors.alpha.neutral[500],
    //     //   border: "1px solid " + colors.alpha.neutral[200],
    //     //   boxShadow: "inset 0px 1px 1px " + colors.alpha.neutral[100],
    //     //   opacity: 1,
    //     // },
    //     // colorPrimary: {
    //     //   "& .MuiSwitch-thumb": {
    //     //     backgroundColor: colors.alpha.white[500],
    //     //   },

    //     //   "&.Mui-checked .MuiSwitch-thumb": {
    //     //     color: colors.alpha.primary[500],
    //     //   },
    //     // },
    //   },
    // },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 36,
          height: 20,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: 0,
            transitionDuration: "300ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: colors.alpha.white[500],
              "& + .MuiSwitch-track": {
                backgroundColor: colors.alpha.primary[500],
                opacity: 1,
                border: 0,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5,
              },
            },
            "&.Mui-focusVisible .MuiSwitch-thumb": {
              color: colors.alpha.white[500],
              border: "6px solid" + colors.alpha.white[500],
            },
            "&.Mui-disabled .MuiSwitch-thumb": {
              color: colors.alpha.neutral[500],
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.7,
            },
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 19,
            height: 20,
            border: "1px solid " + colors.alpha.neutral[300],
          },
          "& .MuiSwitch-track": {
            borderRadius: 26 / 2,
            backgroundColor: colors.alpha.neutral[300],
            opacity: 1,
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          paddingTop: 20,
          paddingBottom: 20,
          background: colors.alpha.neutral[500],
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.alpha.neutral[200],
          background: "inherit",
          "&.Mui-disabled": {
            color: colors.alpha.neutral[200],
          },

          "&.Mui-checked": {
            color: colors.alpha.primary[500],
            background: "none",
          },
          "& .MuiSvgIcon-root": { fontSize: 30 },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.MuiStepIcon-completed": {
            color: colors.alpha.primary[500],
          },
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "div",
          h4: "div",
          h5: "div",
          h6: "div",
          subtitle1: "div",
          subtitle2: "div",
          body1: "div",
          body2: "div",
        },
      },
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
  shape: {
    borderRadius: 8,
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
      color: colors.alpha.neutral[800],
    },
    h5: {
      fontWeight: 500,
      fontSize: 20,
      color: colors.alpha.primary[500],
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
      color: colors.alpha.neutral[400],
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
      color: colors.alpha.neutral[400],
    },
    overline: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: "uppercase",
    },
  },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
});

export function setColorsAsCSSVariables() {
  Object.entries(colors).forEach(([group, values]) => {
    if (typeof values === "object") {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === "object") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            document.documentElement.style.setProperty(
              `--${group}-${key}-${subKey}`,
              subValue as string
            );
          });
        } else {
          document.documentElement.style.setProperty(
            `--${group}-${key}`,
            value as string
          );
        }
      });
    }
  });
}
