# HRMS Frontend (`CMS-React`) — UI/UX, Responsiveness, Reusability & Zero-Regression Engineering Rules

This rule governs all frontend UI/UX modifications, component refactoring, and new feature development inside `CMS-React`. Every change MUST strictly comply with the 6 core mandates below.

---

## Rule 1: Zero Functional Regression (Non-Negotiable)
1. **Preserve API & Data Contracts**: Never rename, drop, or alter payload properties, query parameters, or response handlers (`getRequest`, `postRequest`, service functions, SignalR hubs) when refactoring UI components.
2. **Preserve RBAC & Permission Gates**: Always retain existing `hasModuleFeaturePermission(...)`, `<ProtectedRoute>`, and role checks (`Administrator`, `HRManager`, `HRExecutive`, etc.).
3. **Preserve Business Logic & Calculations**: Statutory payroll rules (`PayrollSettings.tsx`, `PayRollManagement.tsx`), attendance period resolution, and exit clearance statuses must retain 100% behavioral parity.
4. **Verify Compilation**: Every UI change must pass `npm run typecheck` (`tsc --noEmit`) with zero TypeScript errors.

---

## Rule 2: Component Reusability, Structure & Decomposition
1. **File Size & Decomposition Limit**:
   - No new component file may exceed **350 lines**.
   - When touching monolithic files (`AttendanceCalendar.tsx`, `EmployeeExitCaseCard.tsx`, `EmployeeExitManagementCard.tsx`, `FormerEmployeePortalExperience.tsx`, `PayrollSettings.tsx`), extract cohesive sub-views into dedicated, reusable components under `./components/` and isolate state/effects into custom hooks (`use*.ts`).
2. **Unified Shared Primitives**:
   - Prefer shared UI primitives (`src/app/shared/components/ui/MuiPrimitives.tsx`, `C_Modal.tsx`, `ConfirmationModal.tsx`, `C_DataGrid.tsx`) over ad-hoc inline markup.
   - **Button Variants**: Primary CTAs use `variant="contained"`. Secondary/Cancel/Reset actions MUST explicitly specify `variant="outlined"` or `variant="text"` (never rely on an implicit default that styles Cancel buttons as primary CTAs).
   - **Confirmations**: Never use native browser `window.confirm()` or `window.alert()`; always use the shared `<ConfirmationModal />`.
   - **Form Labels**: Only pass `required={true}` to `<FormLabel>` or `<TextInput>` when the field is actually required by the validation schema.

---

## Rule 3: Responsive & Mobile-First Layout Standards
1. **Responsive Breakpoints (`xs`, `sm`, `md`, `lg`, `xl`)**:
   - All page toolbars, filter bars, and action header rows must use responsive flex/grid layouts (`direction={{ xs: "column", sm: "row" }}`, `flexWrap="wrap"`, `gap={1.5}`) so controls never overflow or clip on `320px–768px` viewports.
2. **Mobile Feature Parity**:
   - Never hide global utility controls (such as `<AppStylePicker />` and `<LightDarkMode />` in `Navbar.tsx`) on `< 960px` (`md`) viewports without surfacing them in the mobile header or `<HeaderUserMenu />`.
   - Never hide tab text labels on tablet/mobile (e.g., `.lifecycle-tab-label`) without keeping scrollable text tabs (`variant="scrollable" scrollButtons="auto"`) or accessible `<Tooltip>` labels.
3. **Dialog & Drawer Responsiveness**:
   - Modals (`MuiDialog` / `CustomisedModal`) must use `fullWidth` with responsive `maxWidth` (`sm`, `md`, `lg`) and `minWidth: { xs: "calc(100vw - 32px)", sm: "auto" }` instead of hardcoded desktop `minWidth: 600px`.
4. **Data Tables**:
   - Wrap tables and grids in horizontally scrollable containers (`overflowX: "auto"`, `minWidth: 0`) so wide columns never break the outer `MasterLayout` viewport shell.

---

## Rule 4: Theme Token Purity & Global CSS Hygiene
1. **Multi-Theme Compatibility (`glass`, `slate`, `dawn`, `blush` + Light/Dark)**:
   - Always use MUI theme palette tokens (`color: "text.primary"`, `bgcolor: "background.paper"`, `borderColor: "divider"`) or CSS variables (`var(--mui-palette-*)`).
   - Never introduce hardcoded hex colors (`#ffffff`, `#07142F`, etc.) inside feature components.
2. **Global Override Restrictions (`MuiTheme.ts` & `style.scss`)**:
   - **Print Support**: Never set `body { display: none !important }` inside `@media print`. Only hide navigation chrome (`.app-sidebar`, `.app-header`, `.no-print`) when printing so payslips, reports, and letters print cleanly.
   - **Disabled State Affordance**: `.Mui-disabled` buttons must look clearly disabled (`color: text.disabled`, `backgroundColor: action.disabledBackground`)—never white text on `primary.light`.
   - **IconButtons**: Do not force a global `1px solid` border on all `MuiIconButton` instances; apply borders only via explicit component variants.
   - **Readable Typography**: Maintain a minimum `13px–14px` (`0.8125rem–0.875rem`) base font size for table cells, cards, and buttons; reserve `12px` for captions/chips only.

---

## Rule 5: State Isolation, Form Ergonomics & Feedback Integrity
1. **Strict Form State Isolation**:
   - Never share a single mutable state object (such as a single `draft` state) across multiple independent `<Accordion>` panels, tabs, or dialogs (e.g., `EmployeeExitOperationsPanel.tsx`). Each section must manage its own isolated form state.
2. **Login & Autofill Compatibility**:
   - Never disable form submit buttons using `!(isValid && dirty)` on Login or autofill-eligible forms (`Login.tsx`), as browser password managers populate inputs without triggering Formik's `dirty` flag.
3. **Honest Toast Feedback & Error Handling**:
   - Never trigger `toast.success` or `toast.info` on local checkbox/switch changes before the user clicks Save and the API confirms persistence.
   - Every `try / catch` block around an API request must surface a user-friendly error message via `toast.error(...)` or inline field helper text—never swallow errors with `console.log` alone.

---

## Rule 6: Navigation & Cross-Module Workflow Continuity
1. **Semantic & Stateful Sidebar Navigation**:
   - Sidebar links (`SidebarMenuItem.tsx`) must render semantic anchor links (`component={Link} to={to}`) to support `Ctrl+Click` / Open in New Tab.
   - Parent menu accordions (`Sidebar.tsx`) must automatically expand (`openIndex`) when `location.pathname` matches any child route on initial load or page refresh.
2. **Cross-Screen Action Routing**:
   - Never dispatch `window.dispatchEvent(new CustomEvent(...))` targeting an unmounted route's component (such as `openAttendanceCell` in `PayrollSettings.tsx`). Always navigate via React Router (`navigate("/attendance", { state: { ... } })`) or render a mounted modal/drawer.

