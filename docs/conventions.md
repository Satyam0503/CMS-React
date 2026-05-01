# Conventions

Patterns observed across the codebase. Follow these in new code unless you have a strong reason not to.

---

## File & folder naming

| Kind | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `EmployeeGridView.tsx`, `AddEmployeeStepper.tsx` |
| Service file | `<module>Services.ts` (sometimes lowercase, sometimes `services.ts`) | `employeeServices.ts`, `AttendanceServices.ts`, `services.ts` |
| Model file | `models.ts` (or `model.ts` — both occur) | `employees/models.ts`, `dashboard/model.ts` |
| Auth-internal files | leading underscore | `core/_models.ts`, `core/_requests.ts` |
| Helper file | `<Name>Helpers.ts` | `AuthHelpers.ts`, `RouterHelpers.ts` |
| Hook | `useCamelCase.ts(x)` | `useDebounce.tsx`, `useAppLang` |
| Redux slice | `<name>Slice.ts` | `authSlice.ts`, `userSlice.ts`, `filterSlice.ts` |
| Validation schema | `<feature>Schema.ts` or `<feature>ValidationSchema.ts` | `jobSchema.ts`, `payrollValidationSchema.ts` |
| Routes file | `<Feature>Routes.tsx` | `RecruitmentRoutes.tsx`, `ProfileRoutes.tsx` |

> The casing inconsistency in service file names is historical. **In new code, use `<moduleName>Services.ts`** (PascalCase noun + lowercase first letter) — that is the most common pattern and reads cleanly when imported.

---

## Module folder structure

```
src/app/modules/<moduleName>/
├── <ModuleName>.tsx              # main page / route entry
├── <ModuleName>Services.ts       # API calls
├── models.ts                     # TS interfaces & enums for this module
└── components/
    ├── <FeatureForm>.tsx
    ├── <FeatureList>.tsx
    └── <FeatureFilter>.tsx
```

For modules with sub-routes (recruitment, users), nest the same structure one level deeper:

```
recruitment/
├── services.ts                  # shared across sub-modules
├── models.ts                    # shared
├── jobs/
│   ├── Jobs.tsx
│   └── components/
└── applications/
    ├── Applications.tsx
    └── components/
```

---

## Imports

- **Absolute paths are not configured.** All imports are relative — `../../shared/components/CustomCard`. Don't try to introduce `@/` aliases without updating `tsconfig.json` and `vite.config.ts` together.
- **Keep imports grouped:** node modules → app code → relative imports. Most files in the repo do this loosely; if you reorganize a file, restore the order.
- **Re-export from a barrel only at module boundaries.** `src/app/modules/auth/index.ts` re-exports public surface (`AuthInit`, `Logout`, `AuthHelpers`, `AuthPage`). Internal cross-file imports should reach the source file directly.

---

## Component pattern

```tsx
import { FC, useState, useEffect, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { toast } from 'react-toastify';

import { getCustomStatusCodesErrorMessage } from '../../../utils/common';
import { getEmployeeById } from './employeeServices';
import { EmployeeModel } from './models';

interface Props {
  employeeId: string;
  onClose: () => void;
}

const EmployeeDetail: FC<Props> = ({ employeeId, onClose }) => {
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector(s => s.user.userData);

  const [employee, setEmployee] = useState<EmployeeModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getEmployeeById(employeeId);
        if (cancelled) return;
        if (data.success && data.statusCode === 200) {
          setEmployee(data.methodResult);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        if (!cancelled) toast.error(getCustomStatusCodesErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [employeeId]);

  if (loading) return <CircularLoader />;
  if (!employee) return null;

  return (
    <div>
      <h2><FormattedMessage id="EMPLOYEE.DETAILS" defaultMessage="Employee Details" /></h2>
      {/* … */}
    </div>
  );
};

export default EmployeeDetail;
```

Notable choices:
- **`FC<Props>`** for components with explicit prop types.
- **Cancellation flag** in `useEffect` to avoid setting state after unmount. Most existing components don't do this — new code should, since axios calls aren't currently aborted.
- **Default export** for the page-level component; named export for utility components.

---

## Service pattern

See [`data-layer.md` § Standard service shape](./data-layer.md#standard-service-shape) for the canonical example. Rules:

- Service functions are **named exports** at the top of the file.
- They return `axios.AxiosResponse` directly. The component unwraps `data`.
- Always provide both generics: `postRequest<RequestBody, ResponseEnvelope>`.
- Never inline a URL — use a `ServiceUrl` constant.
- No business logic in services. They are thin transport.

---

## Response handling

Backend wraps every response in either `ApiResponse` or `ResponseData<T>` — defined in [`src/utils/common_types.ts`](../src/utils/common_types.ts):

```ts
interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

interface ResponseData<T> extends ApiResponse {
  totalRecords: number;
  methodResult: T;       // single object
  methodResults: T[];    // array
  items: never[];        // legacy, ignore
}
```

Pattern (use this exact shape):

```ts
try {
  const { data } = await someService(payload);
  if (data.success && data.statusCode === 200) {
    setX(data.methodResult);   // or data.methodResults
  } else {
    toast.error(data.message);
  }
} catch (error) {
  toast.error(getCustomStatusCodesErrorMessage(error));
}
```

The two failure modes are distinct:
- **`data.success === false`** with HTTP `200` or `4xx` → backend rejected the request meaningfully (validation, not-found, conflict). Show `data.message`.
- **Promise rejection** → network failure, `5xx`, or post-refresh-failed `401`. Show the mapped friendly message.

---

## Error handling rules

- **Always** show a toast on failure. Silent failures hide bugs from users and from yourself in dev.
- **Never** wrap the entire component body in try/catch. Wrap the specific async operation.
- **Don't `console.error` and continue.** Either:
  - Log the error and propagate (rethrow), or
  - Catch and show user-visible feedback (toast).
- The codebase has ~145 stray `console.*` calls. Don't add to the count unless you're actively debugging.

---

## State management rules

- **Local first.** `useState` until you can prove a value needs to be shared.
- **Redux for cross-page state.** `user`, `auth`, list filters, online presence.
- **Formik for form state.** Don't mirror Formik state into local `useState`.
- **Context for cross-cutting subsystems.** i18n, theme. Don't reach for context for business state.

---

## Permissions inside components

```tsx
import { useAppSelector } from '../../Redux/hooks';
import { hasModuleFeaturePermission } from '../../../utils/common';
import { ModulesName, Permission } from '../../../utils/enums';

const modulePermissions = useAppSelector(s => s.user.userData?.modulePermission ?? []);
const canEdit = hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, modulePermissions);

return (
  <>
    {canEdit && <EditButton onClick={…} />}
  </>
);
```

If you need this in three or more places per page, lift it to a `useMemo` near the top of the component.

---

## TypeScript

- `strict: true` is on; **don't disable** type checks file-by-file with `// @ts-ignore` or `as any`. The codebase is loose with `any` already (ESLint rule disabled) — new code should be tighter.
- Prefer `interface` for object shapes, `type` for unions / mapped types.
- Use `enum` (`src/utils/enums.ts`) for closed sets that mirror backend constants. Use `as const` arrays for UI-only string sets.

---

## i18n

- **Every user-visible string** goes in `public/locales/*.json`. No exceptions for "small" strings.
- Use `<FormattedMessage id="..." defaultMessage="..." />` so the UI degrades gracefully when a key is missing.
- Use `useIntl()` only when you need the string as a value (placeholders, attributes).
- Don't concatenate translated strings. Use ICU placeholders: `i({ id: 'GREETING' }, { name })` with `"GREETING": "Hello, {name}!"`.

---

## When to add a Redux slice

Add a slice when **at least two** of these are true:
- The state is shared across components that don't share a parent.
- The state must survive a route change.
- A separate subsystem (SignalR, axios interceptor, an external library) needs to mutate it.
- The action history is useful for debugging (Redux DevTools).

Otherwise keep it in component state.

---

## When to add a shared component

Add a shared component to [`src/app/shared/components/`](../src/app/shared/components/) when **at least two** of these are true:
- Two or more modules need it.
- It encapsulates non-trivial logic (debouncing, virtualization, complex MUI composition).
- It enforces a visual standard (status pill, action menu, page header).

Don't promote a component to "shared" preemptively. The first version stays in the module that needs it; the second usage triggers the move.

---

## Permission-related backend coupling

Three places must agree:
1. **Frontend enum**: `ModulesName` in [`src/utils/enums.ts`](../src/utils/enums.ts) — the string value.
2. **Backend constant**: `Codeji.CMS.Utility.Constraints.AppModule` (sibling repo).
3. **Database row** in the `Module` collection — seeded by [`SeedBaseModulesAndPermissions.cs`](../../CMS-Backend-Core/Codeji.CMS.Migrations/Migrations/SeedBaseModulesAndPermissions.cs).

If you add a module on either side without the other, permission checks silently allow or deny everything. Always update all three.

---

## Don't do these

- Don't store secrets / API keys in source. Even reCAPTCHA *site* keys belong in `.env` (the example file currently leaks one — see [`.env.example`](../.env.example)).
- Don't bypass the axios helpers. Calling `axios.post(...)` directly skips the interceptor and your request will fire without auth.
- Don't put a `useEffect` with an empty dep array unless you've thought hard about it. Most missing-dependency bugs in this codebase trace back to that.
- Don't introduce default exports in service files — they make grep harder.
- Don't make a network call inside `render`. Use `useEffect`.
- Don't use `as any`. If you can't type something, type it as `unknown` and narrow.
