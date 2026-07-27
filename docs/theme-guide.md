# Theme Guide

This document explains the theme system used by the frontend, including the color schemes, app styles, typography, surface treatments, and how the selected look flows through the application.

## 1. What the theme system is

The app uses two layers of theming:

- MUI color schemes for light and dark mode
- App styles for the visual surface treatment of the shell, header, cards, and body background

The final look is built from both layers together:

- MUI controls the component palette, text colors, borders, and most component defaults
- The app style controls body background, header chrome, and page-level surface feel

Theme creation happens in:

- `src/app/App.tsx`
- `src/app/modules/theme/MuiTheme.ts`
- `src/app/modules/theme/themePalettes.ts`
- `src/app/modules/theme/useAppStyle.ts`
- `src/_themes/assets/sass/core/components/_app-style.scss`

## 2. Runtime flow

When the app loads:

1. `useAppStyle()` reads the current app style from `localStorage`
2. `App.tsx` writes that style to the `<html>` element as `data-app-style`
3. `createApplicationTheme()` builds the MUI theme using:
   - the active locale
   - the selected app style
   - the light/dark color scheme
4. The SCSS layer reads `[data-app-style="..."]` and adjusts background and header surfaces

This means the final appearance is not only MUI palette-driven. It also depends on the root HTML data attribute and the SCSS style layer.

## 3. Color schemes

The application has two core MUI color schemes.

### Light mode

Defined in `lightPalette` in `src/app/modules/theme/themePalettes.ts`.

Key values:

- `palette.mode`: `light`
- `background.default`: `#f5f5f5`
- `background.paper`: `#ffffff`
- `background.body`: `#f5f5f5`
- `background.header`: `#ffffff`
- `background.card`: `#ffffff`
- `background.sidebar`: `#000000`
- `text.primary`: `#20242d`
- `text.secondary`: `#606978`
- `text.disabled`: `#9299a6`
- `divider`: `rgba(32, 36, 45, 0.14)`

Primary and secondary tones:

- primary main: `#9A56D3`
- primary dark: `#7C41A3`
- primary darker: `#5E2D73`
- secondary main: `#FEBB68`
- secondary dark: `#CC8C4A`
- secondary darker: `#995D2D`

Light mode is the default presentation for the public-facing product surfaces and most admin screens unless the user switches to dark mode.

### Dark mode

Defined in `darkPalette` in `src/app/modules/theme/themePalettes.ts`.

Key values:

- `palette.mode`: `dark`
- `background.default`: `#101318`
- `background.paper`: `#171c24`
- `background.body`: `#101318`
- `background.header`: `#161b22`
- `background.card`: `#171c24`
- `background.box`: `#1d2430`
- `background.sidebar`: `#0c111b`
- `text.primary`: `#f4f5f7`
- `text.secondary`: `#b8bfca`
- `text.disabled`: `#7e8795`
- `divider`: `rgba(226, 232, 240, 0.18)`

Dark mode keeps the same brand color family, but the surfaces become much deeper and contrast is tuned for readability.

## 4. Brand color system

The app uses a purple-and-amber brand family.

### Primary

Primary is the brand anchor:

- `#E6D9F5`
- `#c0a4eb`
- `#ad5ef2`
- `#9A56D3`
- `#8B4CBB`
- `#7C41A3`
- `#6D378B`
- `#5E2D73`

This family is used for:

- buttons
- active states
- chips
- headers
- selected navigation items
- links
- key highlights in cards and analytics

### Secondary

Secondary is the accent/warm companion:

- `#FFF3E0`
- `#FFE2B8`
- `#FFD090`
- `#FFBE78`
- `#FEBB68`
- `#E5A359`
- `#CC8C4A`
- `#B3743B`
- `#995D2D`

This family is used for:

- warm highlights
- supporting surfaces
- badges
- charts
- decorative gradients

## 5. App styles

App styles are selected from the header style picker and stored in `localStorage`.

The available styles are defined in `src/app/modules/theme/useAppStyle.ts`.

### 5.1 Cobalt

Value: `cobalt`

Description:

- Modern cobalt gradient with frosted glass items

Visual behavior:

- soft blue body background
- glassy header treatment
- polished, modern default surface
- works especially well with cards, dashboards, and dense admin screens

Where it is defined:

- `useAppStyle.ts`
- `MuiTheme.ts`
- `_app-style.scss`

Best use:

- general default usage
- balanced modern admin UI
- screens that need a clean but not flat look

### 5.2 Classic

Value: `classic`

Description:

- The original look

Visual behavior:

- minimal override behavior
- mostly relies on the base MUI theme
- avoids extra decorative treatment

Best use:

- users who prefer the default application feel
- conservative internal workflows

### 5.3 Glass

Value: `glass`

Description:

- Translucent surfaces with backdrop blur

Visual behavior:

- semi-transparent paper/card surfaces
- backdrop blur and saturation
- layered, airy appearance

Best use:

- modern dashboards
- marketing-like interfaces
- pages where depth and translucency are desirable

### 5.4 Gradient

Value: `gradient`

Description:

- Vibrant primary to secondary gradient

Visual behavior:

- strong gradient header in light mode
- explicit foreground override so text and icons remain readable
- in dark mode, the header remains legible with a dark-friendly variant

Best use:

- prominent landing areas
- pages that should feel energetic
- hero-heavy screens

### 5.5 Minimal

Value: `minimal`

Description:

- Flat, light, low-contrast

Visual behavior:

- no extra shadows on cards and paper
- sharper, cleaner borders
- understated presentation

Best use:

- high-density data entry
- forms
- users who prefer a restrained UI

### 5.6 Aurora

Value: `aurora`

Description:

- Calm teal and violet with luminous accents

Visual behavior:

- radial teal-violet atmosphere
- soft luminous header treatment
- elegant but slightly expressive

Best use:

- wellness-like or premium-feeling screens
- content where gentle color contrast is useful

### 5.7 Sunset

Value: `sunset`

Description:

- Warm coral, plum, and amber surfaces

Visual behavior:

- warm accent overlays
- slightly richer header tone
- soft, inviting atmosphere

Best use:

- people-centric pages
- notification and activity-focused areas

### 5.8 Executive

Value: `executive`

Description:

- Refined graphite and indigo workspace

Visual behavior:

- muted, professional, high-contrast edges
- more corporate and restrained than the other expressive styles

Best use:

- leadership dashboards
- finance-like or summary-heavy screens
- users who want a more formal look

## 6. Surface treatment

Surface behavior is controlled in `MuiTheme.ts` via `getSurfaceOverrides(appStyle)`.

### Card

Cards receive different treatment depending on the style:

- `cobalt`: soft border, radius `14`, shadowed glass-like card
- `glass`: transparent/translucent card with blur
- `gradient`: rounded card with standard shadow and border
- `minimal`: flat card, small radius, no shadow
- `aurora`: rounded, bordered card with primary glow
- `sunset`: rounded, bordered card with secondary glow
- `executive`: tidy rounded card with formal shadow

### Paper

Paper elements also change with the style:

- `cobalt`: radius `12`
- `glass`: blurred translucent paper
- `gradient`: radius `12`
- `minimal`: radius `4`
- `aurora`: radius `16`
- `sunset`: radius `14`
- `executive`: radius `12`

### App header

The header is heavily influenced by `_app-style.scss`:

- `cobalt`: frosted header with soft blue body gradient
- `glass`: blurred translucent header
- `gradient`: strong brand gradient header in light mode
- `minimal`: plain header with hairline border
- `aurora`: teal-violet tinted header
- `sunset`: warm rose-tinted header
- `executive`: indigo-graphite header

## 7. Typography

### Font family

There is no custom global font family override in the theme files currently.

That means the app uses the platform and MUI default typography stack, which resolves to the standard MUI sans-serif family on the client environment.

In practical terms:

- the app does not currently define a branded custom font
- the visual identity comes from spacing, color, weight, and surface treatment rather than a bespoke typeface

### MUI typography scale

Defined in `MuiTheme.ts`.

#### h1

- weight: `600`
- size: `40px`
- color: `text.primary`

Used for:

- page heroes
- major detail headers
- high-impact titles

#### h2

- weight: `500`
- size: `32px`
- color: `text.primary`

Used for:

- secondary page titles
- section headers with strong emphasis

#### h3

- weight: `600`
- size: `28px`
- line height: `1.4`
- color: `text.secondary`

Used for:

- section headings
- panel titles
- supportive hero statements

#### h4

- weight: `500`
- size: `24px`
- color: `text.primary`

Used for:

- subsection headers
- modal titles
- card content headings

#### h5

- weight: `500`
- size: `20px`
- color: `primary.main`

Used for:

- emphasized section labels
- highlighted job titles or card labels

#### h6

- size: `16px`
- weight: `600`
- color: `text.secondary`

Used for:

- compact headings
- panel labels
- smaller content blocks

#### body1

- size: `14px`
- color: `text.primary`

Used for:

- normal content text
- body copy
- most form-adjacent descriptions

#### body2

- size: `12px`
- color: `text.secondary`

Used for:

- helper copy
- captions
- secondary descriptions

#### button

- weight: `600`

Used for:

- all buttons by default

#### subtitle1

- color: `text.primary`

#### subtitle2

- color: `primary.main`

### Typography treatment rules

The theme also applies component-level text behavior:

- buttons use capitalized words rather than all caps
- paragraph text gets a relaxed line height
- helper text is compact and visually lighter
- links inherit the brand primary color

## 8. Component defaults

The theme applies shared defaults to many MUI components.

### Form fields

- outlined inputs use compact vertical padding
- autofill styling is neutralized
- labels use the secondary text color
- helper text is small and clipped to a compact style

### Buttons

- font size is `12px`
- text is capitalized rather than uppercase
- disabled contained buttons still keep a brand tint

### Icon buttons

- ripple is disabled by default
- small radius and border treatment is applied
- hover state shifts toward the primary brand color

### Chips

- default chip color is primary
- chip radius is reduced for a tighter UI

### Tables

- table headers are bold and compact
- table borders are mostly removed
- pagination is tightened for denser admin use

### Autocomplete

- compact options
- smaller option text
- reduced padding for size-small inputs

### Dialogs

- modal width is capped at `720px` by default
- smaller breakpoints get a smaller minimum width

### Switches

- custom branded thumb and track
- checked state uses the primary color
- disabled state is softened

## 9. SCSS app style layer

The SCSS layer in `_app-style.scss` handles styling outside MUI, especially:

- body background
- header chrome
- app shell interactions
- sidebar feel
- page-level transitions

### Cobalt

- soft body gradient
- frosted header
- default for new tenants

### Glass

- body gradient with blur-friendly backdrop
- transparent header with blur

### Gradient

- vibrant brand gradient header
- light mode and dark mode each have a dedicated header treatment

### Minimal

- clean white body
- plain header

### Aurora

- teal and violet atmospheric background

### Sunset

- warm coral and rose-toned atmosphere

### Executive

- indigo-forward formal body tint

## 10. Sidebar and layout behavior

The sidebar is configured as part of the layout system, not the theme itself, but the theme still affects its appearance through palette tokens.

Relevant layout settings:

- `layoutType: "dark-sidebar"` in `DefaultConfig`
- desktop sidebar is fixed and minimizable
- mobile sidebar is temporary

The sidebar gets its background from:

- `background.sidebar` in the active palette

This means the sidebar can look very different between light and dark mode even when the same app style is selected.

## 11. How style selection works

`useAppStyle()` stores the selected style in `localStorage` under `appStyle`.

Available values:

- `cobalt`
- `classic`
- `glass`
- `gradient`
- `minimal`
- `aurora`
- `sunset`
- `executive`

The style picker in the header writes the selection and triggers a same-tab update so the UI refreshes immediately.

## 12. Practical guidance for contributors

When you add a new screen:

- use MUI theme tokens rather than hardcoded colors when possible
- rely on `primary.main`, `text.secondary`, and `background.paper` for consistency
- keep custom surfaces compatible with both light and dark mode
- check whether the selected app style changes the background or header feel

When you add a new app style:

1. add it to `AppStyle` and `APP_STYLES` in `useAppStyle.ts`
2. add a `surface` branch in `MuiTheme.ts`
3. add an SCSS block in `_app-style.scss`
4. decide how the header should behave in light and dark mode
5. test the style with cards, forms, tables, and a sidebar page

## 13. Quick reference

| Layer | File | Responsibility |
| --- | --- | --- |
| App style state | `src/app/modules/theme/useAppStyle.ts` | Stores and broadcasts the selected visual style |
| Palette | `src/app/modules/theme/themePalettes.ts` | Defines light and dark colors, text, borders, backgrounds |
| MUI theme | `src/app/modules/theme/MuiTheme.ts` | Defines component overrides, typography, and surface treatment |
| Root app wiring | `src/app/App.tsx` | Applies style to `<html>` and creates the active theme |
| Non-MUI styling | `src/_themes/assets/sass/core/components/_app-style.scss` | Handles body, header, and app-shell style variants |

## 14. Font summary

Current typography summary:

- no custom brand font is defined in the codebase
- the UI uses the default MUI/system sans-serif stack
- emphasis comes from weight, size, spacing, and color, not a custom typeface
- if a branded font is added later, it should be documented here and wired through `MuiTheme.ts`

