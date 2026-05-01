# UI Patterns

Visual consistency comes from three things: the **MUI theme**, the **shared component library** under [`src/app/shared/components/`](../src/app/shared/components/), and a single **forms pattern** (Formik + Yup). Use them in that order — write a one-off only when the shared catalog truly doesn't fit.

---

## Theme & styling

### Architecture

| Layer | What | File |
|---|---|---|
| Theme factory | Builds the MUI `Theme` for a given locale | [`src/app/modules/theme/MuiTheme.ts`](../src/app/modules/theme/MuiTheme.ts) |
| Palettes | Color schemes (light/dark) and chart colors | [`src/app/modules/theme/themePalettes.ts`](../src/app/modules/theme/themePalettes.ts) |
| Global styles | Global CSS reset, layout helpers, Metronic-derived utility classes | [`src/_themes/assets/sass/style.scss`](../src/_themes/assets/sass/style.scss) and the surrounding `sass/core/`, `sass/styles/` trees |
| Theme application | `<ThemeProvider>` wrapping the app | [`src/app/App.tsx`](../src/app/App.tsx) |

### Building a theme

```ts
import { createApplicationTheme } from '../modules/theme/MuiTheme';
import { getCurrentLocaleForMui } from '../modules/theme/themePalettes';

const theme = createApplicationTheme(getCurrentLocaleForMui(currentLanguage));
```

Key decisions baked into `MuiTheme.ts`:
- CSS variables enabled (`cssVariables: { colorSchemeSelector: 'class' }`) — dark mode toggles a class, no theme rebuild.
- Two color schemes registered: `light` and `dark`.
- Breakpoints overridden: `xs:0, sm:600, md:960, lg:1280, xl:1840` — `lg` is wider than MUI default, suit the table-heavy admin pages.
- Component overrides for `MuiButton`, `MuiOutlinedInput`, `MuiFormHelperText`, `MuiDataGrid`, etc. Add new overrides here, not inline in components.

### Color tokens

Don't pick hex values inline. Use the theme:

```tsx
sx={{ color: 'primary.main', bgcolor: 'background.paper' }}
```

Or for chart series, use the explicit chart palette:

```ts
import { chartColorpalette } from '../../modules/theme/themePalettes';
```

### Sass

Bootstrap 5 utility classes are available globally (because `bootstrap` is imported in the theme). Prefer MUI's `sx` prop for new styles. Use SCSS files only for:
- Page-level layout that MUI's `Box` + `Stack` can't express cleanly.
- Heavily reused utility classes already defined in the Metronic baseline.

---

## Forms

### Stack

- **State**: [Formik 2](https://formik.org/) — manages values, errors, touched, submission.
- **Validation**: [Yup 1.x](https://github.com/jquense/yup) — schemas in [`src/utils/Schema/`](../src/utils/Schema/), one file per form domain.
- **Field bindings**: custom inputs under [`src/app/shared/components/form-component/`](../src/app/shared/components/form-component/) connect to Formik via `useField()`.

### Standard form skeleton

```tsx
import { Formik, Form } from 'formik';
import TextInput from '../../shared/components/form-component/TextInput';
import { applicantValidationSchema } from '../../../utils/Schema/applicantValidationSchema';

<Formik
  initialValues={{ firstName: '', email: '' }}
  validationSchema={applicantValidationSchema}
  onSubmit={async (values, { setSubmitting }) => {
    try {
      const { data } = await addApplicant(values);
      if (data.success && data.statusCode === 200) {
        toast.success(data.message);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(getCustomStatusCodesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }}
>
  {({ isSubmitting, isValid }) => (
    <Form>
      <TextInput name="firstName" label="First name" />
      <TextInput name="email" label="Email" type="email" />
      <Button type="submit" disabled={isSubmitting || !isValid}>Save</Button>
    </Form>
  )}
</Formik>
```

### Validation schemas — where they live

| File | What it validates |
|---|---|
| [`employeeSchema.ts`](../src/utils/Schema/employeeSchema.ts) | Employee personal info |
| [`registrationSchema.ts`](../src/utils/Schema/registrationSchema.ts) | Company registration |
| [`applicantValidationSchema.ts`](../src/utils/Schema/applicantValidationSchema.ts) | Job applicant submission |
| [`jobSchema.ts`](../src/utils/Schema/jobSchema.ts) | Job vacancy CRUD |
| [`leaveManagementValidationSchemas.ts`](../src/utils/Schema/leaveManagementValidationSchemas.ts) | Leave request, leave policy |
| [`payrollValidationSchema.ts`](../src/utils/Schema/payrollValidationSchema.ts) | Payroll structure |
| [`salaryValidationSchema.ts`](../src/utils/Schema/salaryValidationSchema.ts) | Salary components |
| [`userSchema.ts`](../src/utils/Schema/userSchema.ts) | User profile edits |
| [`companyValidationSchema.ts`](../src/utils/Schema/companyValidationSchema.ts) | Company details edit |
| [`noticeValidationSchema.ts`](../src/utils/Schema/noticeValidationSchema.ts) | Notice posting |
| [`policySchema.ts`](../src/utils/Schema/policySchema.ts) | Policy document |
| [`filterValidationSchema.ts`](../src/utils/Schema/filterValidationSchema.ts) | Search/filter inputs |
| [`calendarSchema.ts`](../src/utils/Schema/calendarSchema.ts) | Holiday / event |
| [`workHistoryValidationSchema.ts`](../src/utils/Schema/workHistoryValidationSchema.ts) | Employment history entries |

When adding a new form, create a new schema file in this folder rather than inlining the schema. Keep messages translatable: `.required(i({ id: 'VALIDATION.REQUIRED' }))`.

### Form components

| Component | Use for |
|---|---|
| [`TextInput.tsx`](../src/app/shared/components/form-component/TextInput.tsx) | Text / email / password / number — Formik-bound |
| [`SelectInput.tsx`](../src/app/shared/components/form-component/SelectInput.tsx) | Dropdown |
| [`ErrorLabel.tsx`](../src/app/shared/components/form-component/ErrorLabel.tsx) | Inline error display |
| [`PasswordStrengthMeter.tsx`](../src/app/shared/components/form-component/PasswordStrengthMeter.tsx) | Password strength bar |
| [`VisuallyHiddenInput.tsx`](../src/app/shared/components/form-component/VisuallyHiddenInput.tsx) | Hidden file input behind a styled button |

If your form needs a date picker, use [`CustomisedDatePicker.tsx`](../src/app/shared/components/CustomisedDatePicker.tsx) (dayjs-based, MUI X) and wire the `value`/`onChange` to `formik.setFieldValue('date', x)` directly — it isn't auto-bound via `useField`.

---

## Shared components catalog

Reusable, theme-aware components in [`src/app/shared/components/`](../src/app/shared/components/). Pick from this list before writing a new one. Group them by purpose:

### Tables / data grid

| Component | When to use |
|---|---|
| [`CustomDataGrid.tsx`](../src/app/shared/components/CustomDataGrid.tsx) | The default — MUI X DataGrid wrapper with sorting, server-side pagination, action column |
| [`CustomisedTable.tsx`](../src/app/shared/components/CustomisedTable.tsx) | Lightweight alternative when you don't need DataGrid's features |
| [`TableSkeleton.tsx`](../src/app/shared/components/TableSkeleton.tsx) | Loading placeholder |
| [`Pagination.tsx`](../src/app/shared/components/Pagination.tsx) | Custom pagination bar (use when not in DataGrid) |
| [`TableSorting.tsx`](../src/app/shared/components/TableSorting.tsx) | Column-header sort UI |
| [`AvatarCell.tsx`](../src/app/shared/components/AvatarCell.tsx) | Avatar + name cell renderer for employee tables |
| [`GridActionsCell.tsx`](../src/app/shared/components/GridActionsCell.tsx) | Action menu (view / edit / delete) for grid rows |

### Inputs / controls

| Component | When to use |
|---|---|
| [`SearchInput.tsx`](../src/app/shared/components/SearchInput.tsx) | Debounced search box |
| [`MuiSelect.tsx`](../src/app/shared/components/MuiSelect.tsx) | Standalone MUI Select (non-Formik) |
| [`CustomSwitchButton.tsx`](../src/app/shared/components/CustomSwitchButton.tsx) | On/off toggle |
| [`CustomIconButton.tsx`](../src/app/shared/components/CustomIconButton.tsx) | Icon-only button with consistent hover state |
| [`CustomisedButton.tsx`](../src/app/shared/components/CustomisedButton.tsx) | Themed `<Button>` |
| [`CustomisedDatePicker.tsx`](../src/app/shared/components/CustomisedDatePicker.tsx) | Date picker (dayjs) |
| [`HalfRating.tsx`](../src/app/shared/components/HalfRating.tsx) | 0–5 star rating |

### Layout & cards

| Component | When to use |
|---|---|
| [`CustomCard.tsx`](../src/app/shared/components/CustomCard.tsx) | Themed `<Card>` |
| [`IconStat.tsx`](../src/app/shared/components/IconStat.tsx) | KPI card (icon + number) |
| [`PageData.tsx`](../src/app/shared/components/PageData.tsx) | Page header + breadcrumb |
| [`CardMessage.tsx`](../src/app/shared/components/CardMessage.tsx) | Empty-state / informational card |

### Modals

| Component | When to use |
|---|---|
| [`CustomisedModal.tsx`](../src/app/shared/components/CustomisedModal.tsx) | Themed MUI Modal wrapper for forms / details |
| [`ConfirmationModal.tsx`](../src/app/shared/components/ConfirmationModal.tsx) | Confirm-before-destructive-action dialog |

### Feedback / status

| Component | When to use |
|---|---|
| [`StyledStatus.tsx`](../src/app/shared/components/StyledStatus.tsx) | Colored status pill ("Pending" / "Approved" / etc.) |
| [`CircularLoader.tsx`](../src/app/shared/components/CircularLoader.tsx) | Spinning loader |
| [`CustomToastComponents.tsx`](../src/app/shared/components/CustomToastComponents.tsx) | Custom toast bodies |
| [`UnAuthorizedAccess.tsx`](../src/app/shared/components/UnAuthorizedAccess.tsx) | 403 page |
| [`ErrorBoundary.tsx`](../src/app/shared/components/ErrorBoundary.tsx) | Top-level error catch |
| [`ViewLeaveReason.tsx`](../src/app/shared/components/ViewLeaveReason.tsx) | Inline leave-reason viewer |

### Charts

| Component | When to use |
|---|---|
| [`DonutChart.tsx`](../src/app/shared/components/DonutChart.tsx) | Pie/donut via MUI X-Charts (smaller bundle) |
| [`DonutApexChart.tsx`](../src/app/shared/components/DonutApexChart.tsx) | Pie/donut via ApexCharts (more options, heavier) |

> Prefer MUI X-Charts for new work — it's already in the bundle from data-grid. Use ApexCharts only when you need a chart type MUI doesn't have.

### Editors / viewers

| Component | When to use |
|---|---|
| [`TextEditor.tsx`](../src/app/shared/components/TextEditor.tsx) | Rich-text editor (`react-quill`) for notice / policy / job description fields |
| [`PdfViewer.tsx`](../src/app/shared/components/PdfViewer.tsx) | PDF preview (resumes, payslips) |
| [`WordDocViewer.tsx`](../src/app/shared/components/WordDocViewer.tsx) | DOC / DOCX preview |
| [`ImageCropper.tsx`](../src/app/shared/components/ImageCropper.tsx) | Crop avatar / company logo before upload |

### Filters

| Component | When to use |
|---|---|
| [`FilterComponent.tsx`](../src/app/shared/components/FilterComponent.tsx) | Filter popover wrapper — list pages plug their filter form into this |
| [`ActionComponent.tsx`](../src/app/shared/components/ActionComponent.tsx) | Action menu triggered from a button |

---

## Layout

[`src/_themes/layout/MasterLayout.tsx`](../src/_themes/layout/MasterLayout.tsx) wraps every authenticated page:

```
<MasterLayout>
  <Header />     {/* logo, search, language switcher, user menu */}
  <Sidebar />    {/* SideBarTabList drives the menu items */}
  <main>{children}</main>   {/* react-router <Outlet /> */}
  <Footer />
</MasterLayout>
```

The sidebar items come from a static config (`SideBarTabList` in `src/utils/constant/`); each item is filtered against the current user's `modulePermission` so a user only sees the menu items they can access.

---

## Iconography

- **MUI Icons** (`@mui/icons-material`) for in-app actions — pick the closest match.
- Custom SVGs go in `public/media/svg/` and are loaded via `<img src="/media/svg/icon.svg" />` (avoid inline SVG components — they bloat bundle size).

---

## Common pitfalls (do these things)

- **Use `key` from a stable ID, never the array index.** Multiple files in the codebase use `key={index}` (TableSkeleton, JobsSection, CalendarDays, etc.) — that breaks as soon as the list reorders. New code should use `key={item.id}`.
- **Sanitize HTML before `dangerouslySetInnerHTML`.** Always wrap with `sanitizeHtmlContent()` from [`src/utils/common.ts`](../src/utils/common.ts). Three sites in the codebase still don't (JobInfo, UploadPayRollData, tableColumns:282) — copy the pattern from [`ViewJobDetails.tsx:132`](../src/app/modules/recruitment/jobs/components/ViewJobDetails.tsx#L132) instead.
- **`alt` on every `<img>`.** Even if it's decorative, use `alt=""` so screen readers can skip it. Don't omit the attribute.
- **Use `<button>` for clickable things.** A `<span onClick>` won't get keyboard focus or screen-reader semantics.
- **Connect form labels with `htmlFor`.** A `<Typography>` next to a `<TextField>` is not a label.
- **Don't put business logic in components.** Service calls and data transformation belong in the module's `*Services.ts` and `models.ts`. Components should be presentation + thin glue.
