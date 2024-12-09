
import { alpha, createTheme, lighten, darken } from '@mui/material';



const themeColors = {
  primary: '#9A56D3',
  secondary: '#FEBB68',
  success: '#4CAF50',
  info: '#7F9BFF',
  neutral:"#737373",
  warning: '#FFC107',
  error: '#F44336',
  white:"#ffffff",
  territory:"636D79",

};


const colors = {

  shadows: {
    medium:
      '0px 1px 4px rgba(85, 105, 255, 0.25), 0px 3px 12px 2px rgba(85, 105, 255, 0.35)',
    card: 'rgba(0, 0, 0, 0.04) 0px 3px 5px;',
  
  },

  
  layout: {
    general: {
      bodyBg: '#f5f5f5'
    },
    sidebar: {
      background: themeColors.territory,
      textColor: themeColors.white,
      dividerBg: themeColors.neutral,
      menuItemColor: '#242E6F',
      menuItemColorActive: themeColors.secondary,
      menuItemBg: themeColors.white,
      menuItemBgActive: '#f2f5f9',
      menuItemIconColor: lighten(themeColors.secondary, 0.3),
      menuItemIconColorActive: themeColors.primary,
      menuItemHeadingColor: darken(themeColors.secondary, 0.3)
    }
  },
  alpha: {
    primary: {
      200:"#E6D9F5",
      300: "#C0A4EB",
      400: "#AC89E6",
      500: "#9A56D3",
      600: "#8B4CBB",
      700: "#7C41A3",
      800: "#6D378B",
      900: "#5E2D73",
      100: "#E6D9F5"
    },
    secondary: {
      200:"#FFE2B8",
      300: "#FFD090",
      400: "#FFBE78",
      500: "#FEBB68",
      600: "#E5A359",
      700: "#CC8C4A",
      800: "#B3743B",
      900: "#995D2D",
      100: "#FFF3E0"
    },
    success: {
      200:"#C8F2CC",
      300: "#A4EBAB",
      400: "#80E389",
      500: "#4CAF50",
      600: "#439D49",
      700: "#37843C",
      800: "#2A692F",
      900: "#1A4720",
      100: "#ECF9ED"
    },
    info: {
      200:"#DDE6FF",
      300: "#CFD8FF",
      400: "#A9B8FF",
      500: "#7F9BFF",
      600: "#5472FA",
      700: "#3B5BD4",
      800: "#2B46A5",
      900: "#1A3173",
      100: "#F0F4FF"
    },
    neutral: {
      200: "#E5E5E5",
      300:"#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600:"#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      100: "#F5F5F5"
    },
    Warning: {
      200:"#FFF2B3",
      300: "#FFE680",
      400: "#FFDA4D",
      500: "#FFC107",
      600: "#FFA000",
      700: "#FF7800",
      800: "#E86005",
      900: "#BA4303",
      100: "#FFFBE6"
    },
    danger: {
      200:"#FFC8C7",
      300: "#FFA4A3",
      400: "#FF8080",
      500: "#F44336",
      600: "#E03131",
      700: "#C62828",
      800: "#A51D1D",
      900: "#7F1212",
      100: "#FFECEB"
    },
    
  },

};

const colorThemeText = {
  heading: colors.alpha.neutral[800],
  secondaryHeading: colors.alpha.primary[500],
  bodyText:colors.alpha.neutral[600],
  linkText:colors.alpha.primary[500],
  sidebarBG:themeColors.territory,
  sidebarText:themeColors.white,
  sidebarLink:colors.alpha.secondary[500],
  bodyBG:colors.alpha.neutral[100],

  
}
export const MuiTheme = createTheme({

  colors: {
    shadows: {
      medium: colors.shadows.medium,
    },

  },
  general: {
    reactFrameworkColor: '#00D8FF',
    borderRadiusSm: '6px',
    borderRadius: '10px',
    borderRadiusLg: '12px',
    borderRadiusXl: '16px',
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
      '2px 0 3px rgba(159, 162, 191, .18), 1px 0 1px rgba(159, 162, 191, 0.32)',
    width: '290px'
  },

  spacing: 9,
  palette: {
    common: {
      white: themeColors.white
    },

    /// text of table
    text: {
      primary:themeColors.primary,
      secondary:themeColors.secondary,
    },
    background: {
      paper: themeColors.white,
      default: colors.layout.general.bodyBg
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
      activatedOpacity: 0.12
    },
  
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1840
    }
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(darken(themeColors.primary, 0.4), 0.2),
          backdropFilter: 'blur(2px)',

          '&.MuiBackdrop-invisible': {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(2px)'
          }
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          marginLeft: 8,
          marginRight: 8,
          fontWeight: 'bold'
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          width: '100%',
          height: '100%'
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
          flex: 1
        },
        '#root': {
          width: '100%',
          height: '100%',
          display: 'flex',
          flex: 1,
          flexDirection: 'column'
        },
        html: {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased'
        },
        '.child-popover .MuiPaper-root .MuiList-root': {
          flexDirection: 'column'
        },
        '#nprogress': {
          pointerEvents: 'none'
        },
        '#nprogress .bar': {
          background: themeColors.primary,
        },
        '#nprogress .spinner-icon': {
          borderTopColor: themeColors.primary,
          borderLeftColor: themeColors.primary,
        },
        '#nprogress .peg': {
          boxShadow:
            '0 0 15px ' +
            themeColors.primary +
            ', 0 0 8px' +
            themeColors.primary
        },
        ':root': {
          '--swiper-theme-color': themeColors.primary,
        },
        code: {
          background: themeColors.primary,
          color: themeColors.primary,
          borderRadius: 4,
          padding: 4
        },
        '@keyframes ripple': {
          '0%': {
            transform: 'scale(.8)',
            opacity: 1
          },
          '100%': {
            transform: 'scale(2.8)',
            opacity: 0
          }
        },
        '@keyframes float': {
          '0%': {
            transform: 'translate(0%, 0%)'
          },
          '100%': {
            transform: 'translate(3%, 3%)'
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        iconOutlined: {
          color: colors.alpha.neutral[500]
        },
        icon: {
          top: 'calc(50% - 14px)'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiInputAdornment-positionEnd.MuiInputAdornment-outlined': {
            paddingRight: 6
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.alpha.neutral[500]
          },
          '&.Mui-focused:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: themeColors.primary,
          }
        }
      }
    },
    MuiListSubheader: {
      styleOverrides: {
        colorPrimary: {
          fontWeight: 'bold',
          lineHeight: '40px',
          fontSize: 13,
          background: colors.alpha.neutral[500],
          color: colors.alpha.neutral[700]
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        action: {
          marginTop: -5,
          marginBottom: -5,
          paddingTop:15,
        },
        title: {
          fontSize: 15
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          borderRadius: '50px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: {
          background: themeColors.primary,
          color: colors.alpha.neutral[100],

          '&:hover': {
            background: themeColors.primary
          }
        },
        deleteIcon: {
          color: themeColors.primary,

          '&:hover': {
            color: themeColors.white
          }
        },
        
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',

          '&.Mui-expanded': {
            margin: 0
          },
          '&::before': {
            display: 'none'
          }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 'bold'
        },
        colorDefault: {
          background: colors.alpha.neutral[300],
          color: themeColors.white
        }
      }
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: {
          alignItems: 'center'
        },
        avatar: {
          background: colors.alpha.neutral[100],
          fontSize: 13,
          color: colors.alpha.neutral[700],
          fontWeight: 'bold',

          '&:first-of-type': {
            border: 0,
            background: 'transparent'
          }
        }
      }
    },
    MuiListItemAvatar: {
      styleOverrides: {
        alignItemsFlexStart: {
          marginTop: 0
        }
      }
    },
    MuiPaginationItem: {
      styleOverrides: {
        page: {
          fontSize: 13,
          fontWeight: 'bold',
          transition: 'all .2s'
        },
        textPrimary: {
          '&.Mui-selected': {
            boxShadow: colors.shadows.medium
          },
          '&.MuiButtonBase-root:hover': {
            background: colors.alpha.neutral[500]
          },
          '&.Mui-selected.MuiButtonBase-root:hover': {
            background: themeColors.primary,
          }
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          textTransform: 'none',
          paddingLeft: 16,
          paddingRight: 16,

          '.MuiSvgIcon-root': {
            transition: 'all .2s'
          }
        },
        endIcon: {
          marginRight: -8
        },
        containedSecondary: {
          backgroundColor: themeColors.primary,
          color: themeColors.white,
          border: '1px solid ' + colors.alpha.neutral[300]
        },
        outlinedSecondary: {
          backgroundColor: themeColors.white,

          '&:hover, &.MuiSelected': {
            backgroundColor: colors.alpha.neutral[500],
            color: colors.alpha.neutral[100]
          }
        },
        sizeSmall: {
          padding: '6px 16px',
          lineHeight: 1.5
        },
        sizeMedium: {
          padding: '7px 20px',
          color: themeColors.white,
          fontWeight: 500,
        },
        sizeLarge: {
          padding: '11px 24px'
        },
        textSizeSmall: {
          padding: '7px 12px'
        },
        textSizeMedium: {
          padding: '9px 16px'
        },
        textSizeLarge: {
          padding: '12px 16px'
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false
      },
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
      
    },
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          color:themeColors.primary,
          background: themeColors.white,
          transition: 'all .2s',

          '&:hover, &.Mui-selected, &.Mui-selected:hover': {
            color: themeColors.white,
            background: themeColors.primary,
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,

          '& .MuiTouchRipple-root': {
            borderRadius: 8
          }
        },
        sizeSmall: {
          padding: 4
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '& .MuiTouchRipple-root': {
            opacity: 0.3
          }
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          background: colors.alpha.neutral[100],
          border: 0,
          height: 1
        },
        vertical: {
          height: 'auto',
          width: 1,

          '&.MuiDivider-flexItem.MuiDivider-fullWidth': {
            height: 'auto'
          },
          '&.MuiDivider-absolute.MuiDivider-fullWidth': {
            height: '100%'
          }
        },
        withChildren: {
          '&:before, &:after': {
            border: 0
          }
        },
        wrapper: {
          background: themeColors.white,
          fontWeight: 'bold',
          height: 24,
          lineHeight: '24px',
          marginTop: -12,
          color: 'inherit',
          textTransform: 'uppercase'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 0
        },
        elevation0: {
          
          boxShadow: 'none'
        },
        elevation: {
          boxShadow: colors.shadows.card
        },
        elevation2: {
          boxShadow: colors.shadows.card
        },
        elevation24: {
          boxShadow: colors.shadows.card
        },
        outlined: {
          boxShadow: colors.shadows.card
        }
      }
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover'
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 6
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-valueLabelCircle, .MuiSlider-valueLabelLabel': {
            transform: 'none'
          },
          '& .MuiSlider-valueLabel': {
            borderRadius: 6,
            background: colors.alpha.neutral[100],
            color: themeColors.white
          }
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,

          '& .MuiListItem-button': {
            transition: 'all .2s',

            '& > .MuiSvgIcon-root': {
              minWidth: 34
            },

            '& .MuiTouchRipple-root': {
              opacity: 0.2
            }
          },
          '& .MuiListItem-root.MuiButtonBase-root.Mui-selected': {
            backgroundColor: alpha(themeColors.primary, 0.4)
          },
          '& .MuiMenuItem-root.MuiButtonBase-root:active': {
            backgroundColor: alpha(themeColors.primary, 0.4)
          },
          '& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root': {
            opacity: 0.2
          }
        },
        padding: {
          padding: '12px',

          '& .MuiListItem-button': {
            borderRadius: 6,
            margin: '1px 0'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          height: 45,
          minHeight: 45,
          overflow: 'visible',
          
        },
        indicator: {
          height: 45,
          minHeight: 45,
          borderRadius: 0,
          background: themeColors.white,
     
          color: colors.alpha.neutral[800],
        },
        scrollableX: {
          overflow: 'visible !important'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          height: 45,
          minHeight: 45,
          borderRadius: 0,
          transition: 'color .2s',
          textTransform: 'capitalize',
          background: themeColors.white,
          

          '&.MuiButtonBase-root': {
            minWidth: 'auto',
            paddingLeft: 20,
            paddingRight: 20,
            marginRight: 4,
            // border: ' 0px 0px 5px 0px solid ' + colors.primary.dark,
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: themeColors.primary,
      
            zIndex: 5
          },
          '&:hover': {
            color: themeColors.primary
          }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          padding: 12
        },
        list: {
          padding: 12,

          '& .MuiMenuItem-root.MuiButtonBase-root': {
            fontSize: 14,
            marginTop: 1,
            marginBottom: 1,
            transition: 'all .2s',
            color: colors.alpha.neutral[700],

            '& .MuiTouchRipple-root': {
              opacity: 0.2
            },

            '&:hover, &:active, &.active, &.Mui-selected': {
              color: colors.alpha.neutral[100],
              background: alpha(themeColors.primary, 0.4)
            }
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          background: 'transparent',
          transition: 'all .2s',

          '&:hover, &:active, &.active, &.Mui-selected': {
            color: colors.alpha.neutral[100],
            background: alpha(themeColors.primary, 0.4)
          },
          '&.Mui-selected:hover': {
            background: alpha(themeColors.primary, 0.4)
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.MuiButtonBase-root': {
            color: themeColors.primary,

            '&:hover, &:active, &.active, &.Mui-selected': {
              color: colors.alpha.neutral[100],
              background: lighten(themeColors.primary, 0.5)
            }
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          margin: 1
        },
        root: {
          '.MuiAutocomplete-inputRoot.MuiOutlinedInput-root .MuiAutocomplete-endAdornment':
            {
              right: 14
            }
        },
        clearIndicator: {
          background: themeColors.primary,
          color: themeColors.primary,
          marginRight: 8,

          '&:hover': {
            background:themeColors.primary,
            color: themeColors.primary,
          }
        },
        popupIndicator: {
          color: colors.alpha.neutral[500],

          '&:hover': {
            background: themeColors.primary,
            color: themeColors.primary,
          }
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          '& .MuiIconButton-root': {
            padding: 8
          }
        },
        select: {
          '&:focus': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '0 !important',
          padding: '0 !important'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        head: {
          background: colors.alpha.neutral[500]
        },
        root: {
          transition: 'background-color .2s',

          '&.MuiTableRow-hover:hover': {
            backgroundColor: colors.alpha.neutral[500]
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: colors.alpha.neutral[100],
          fontSize: 14
        },
        head: {
          textTransform: 'uppercase',
          fontSize: 13,
          fontWeight: 'bold',
          // color: themeColors.primaryAlt
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          lineHeight: 1.5,
          fontSize: 14
        },
        standardInfo: {
          color: themeColors.primary,
        },
        action: {
          color: colors.alpha.neutral[700]
        }
      }
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(colors.alpha.neutral['100'], 0.95),
          padding: '8px 16px',
          fontSize: 13
        },
        arrow: {
          color: alpha(colors.alpha.neutral['100'], 0.95)
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          height: 33,
          overflow: 'visible',

          '& .MuiButtonBase-root': {
            position: 'absolute',
            padding: 6,
            transition:
              'left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
          },
          '& .MuiIconButton-root': {
            borderRadius: 100
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            opacity: 0.3
          }
        },
        thumb: {
          border: '1px solid ' + colors.alpha.neutral[300],
          boxShadow:
            '0px 9px 14px ' +
            colors.alpha.neutral[100] +
            ', 0px 2px 2px ' +
            colors.alpha.neutral[100]
        },
        track: {
          backgroundColor: colors.alpha.neutral[500],
          border: '1px solid ' + colors.alpha.neutral[100],
          boxShadow: 'inset 0px 1px 1px ' + colors.alpha.neutral[100],
          opacity: 1
        },
        colorPrimary: {
          '& .MuiSwitch-thumb': {
            backgroundColor: themeColors.white
          },

          '&.Mui-checked .MuiSwitch-thumb': {
            backgroundColor: themeColors.primary,
          }
        }
      }
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          paddingTop: 20,
          paddingBottom: 20,
          background: colors.alpha.neutral[500]
        }
      }
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.MuiStepIcon-completed': {
            color: themeColors.primary,
          }
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'div',
          h4: 'div',
          h5: 'div',
          h6: 'div',
          subtitle1: 'div',
          subtitle2: 'div',
          body1: 'div',
          body2: 'div'
        }
      },
      styleOverrides: {
        gutterBottom: {
          marginBottom: 4
        },
        paragraph: {
          fontSize: 17,
          lineHeight: 1.7
        }
      }
    }
  },
  shape: {
    borderRadius: 10
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
      fontWeight: 600,
      fontSize: 24,
      color:colorThemeText.heading
  
    },
    h5: {
      fontWeight: 500,
      fontSize: 20,
      color:colorThemeText.secondaryHeading
    },
    h6: {
      fontSize: 16,
      color:colorThemeText.heading
    },
    body1: {
      fontSize: 14,
      color:colorThemeText.bodyText
    },
    body2: {
      fontSize: 12,
      color:colorThemeText.bodyText
    },
    button: {
      fontWeight: 600
      
    },
    caption: {
      fontSize: 13,
      textTransform: 'uppercase',
      color: colors.alpha.neutral[500]
    },
    subtitle1: {
      fontSize: 14,

    },
    subtitle2: {
      fontWeight: 400,
      fontSize: 12,
   
    },
    overline: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase'
    },
  },
  shadows: [
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none'
  ]
});


