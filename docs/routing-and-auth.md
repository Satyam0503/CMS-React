# Routing & Auth

## Route tree

```
<BrowserRouter>
└── <AppRoutes />                                           (src/app/routing/AppRoutes.tsx)
    ├── /error/*           → <ErrorsPage />                 (public)
    ├── /career/:id        → <Career />                     (public — sets cId in localStorage)
    ├── /auth/*            → <AuthPage />                   (public, only when NOT authed)
    ├── /logout            → <Logout />
    └── /*                 → <PrivateRoutes />              (only when authed)
        └── <MasterLayout>                                  (header / sidebar / footer)
            ├── /dashboard                  → <Dashboard />
            ├── /profile/*                  → <ProfileRoutes />        (own profile)
            ├── /employees                  → <Employees />            module=Employees
            ├── /employees/:employeeid/*    → <ProfileRoutes />        (other employees)
            ├── /attendance                 → <EmployeeAttendance />   module=Attendance
            ├── /leavemanagement/*          → <LeaveManagementRoutes />module=LeaveManagement
            ├── /payroll                    → <PayRollManagement />    module=PayRoll
            ├── /settingspayroll            → <PayrollSettings />      module=PayrollSettings
            ├── /recruitment/*              → <RecruitmentRoutes />    (per-sub-route gates)
            ├── /calendar                   → <Calendar />             module=Calendar
            ├── /noticeboard/*              → <NoticeBoardRoutes />
            ├── /companypolicy/*            → <PoliciesRoutes />
            ├── /admin/*                    → <adminRoutes />          adminOnly
            ├── /unauthorize                → <UnAuthorizedAccess />
            └── *                           → 404 redirect
```

Top of tree is in [`AppRoutes.tsx`](../src/app/routing/AppRoutes.tsx); the `MasterLayout` + lazy module mounts are in [`PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx). Sub-route trees live next to it as `<Feature>Routes.tsx`.

## Public vs protected switching

[`AppRoutes.tsx`](../src/app/routing/AppRoutes.tsx) reads `state.auth.isUserAuthenticated`:

- **Authed** → `<PrivateRoutes />` mounted at `/*`. Hitting `/auth/*` while authed redirects to `/dashboard`.
- **Not authed** → only `error`, `career`, `auth`, `logout` paths exist. Anything else falls through to `/auth`.

Public routes that are accessible whether or not you're logged in (e.g. `career`, `error`) are declared **outside** the auth-gated branch.

## Lazy loading

Every route in [`PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx) uses `React.lazy()` and is wrapped in a local `<SuspensedView>` that drives a `react-topbar-progress-indicator` while the chunk loads. New routes should follow the same pattern:

```tsx
const NewModule = lazy(() => import('../modules/newModule/NewModule'));

<Route
  path="newmodule"
  element={
    <SuspensedView>
      <ProtectedRoute module={ModulesName.NewModule}>
        <NewModule />
      </ProtectedRoute>
    </SuspensedView>
  }
/>
```

## Auth bootstrap

Implemented in [`Auth.tsx`](../src/app/modules/auth/core/Auth.tsx) (exports `AuthInit`):

1. On mount, read tokens from `localStorage` via `getLocalKey()` (key `kt-auth-react-v`, value `{ token, refreshToken }`).
2. If a token exists:
   1. Call `getSignedUserDetails()` from [`_requests.ts`](../src/app/modules/auth/core/_requests.ts).
   2. Dispatch `setCurrentUser(userData)` → `userSlice`.
   3. Dispatch `setAuth()` → `authSlice` flips `isUserAuthenticated = true`.
   4. Apply the user's `defaultLanguage` to dayjs, MUI locale, and the i18n context.
   5. Hide splash screen, render children.
3. If no token, OR the call fails → navigate to `/logout` which clears state and lands on `/auth`.

`AuthInit` wraps every protected page so this runs exactly once per app load.

## Token refresh

Implemented in the response interceptor in [`src/server/axios.ts`](../src/server/axios.ts):

- **On `401`** for any request:
  1. If a refresh isn't already in flight, set `isRefreshing = true` and call `refreshTokenAsync()`.
  2. Save the new `{ token, refreshToken }` via `setLocalKey()` and update axios defaults.
  3. Replay the original request with the new bearer.
  4. Concurrent 401s during the refresh window are queued in `failedRequestQueue` and resolved (or rejected) once refresh completes — only **one** refresh fires per token.
- **On refresh failure** → `localStorage.clear()`, dispatch logout, redirect to `/auth`.

> **Caveat.** Tokens live in `localStorage`, which is XSS-readable. The three unsanitized `dangerouslySetInnerHTML` sites flagged in [`modules.md`](./modules.md) are therefore high-risk — fix them before considering this file path-of-least-resistance.

## Permission model

There are two layers and they are independent:

### Layer 1 — Role-based (coarse)

User has exactly one `roleType`:

```ts
enum Roles {
  Administrator = 1,
  HRManager     = 2,
  Employee      = 3,
}
```

Use `<ProtectedRoute adminOnly={true}>` to gate Admin-only routes. Other roles are *not* enforced via this prop — granular control is per module/permission.

### Layer 2 — Module + Permission (fine-grained)

Every user carries `userData.modulePermission: ModulePermissoinModel[]`. Each entry says "this user has these specific permissions on this module":

```ts
enum ModulesName {
  Dashboard       = 'Dashboard',
  Employees       = 'Employees',
  Attendance      = 'Attendance',
  LeaveManagement = 'Leave_Management',
  Calendar        = 'Calendar',
  NoticeBoard     = 'Notice_Board',
  Jobs            = 'Jobs',
  Applications    = 'Applications',
  ProcessLog      = 'Process_Log',
  PayRoll         = 'PayRoll',
  Policy          = 'Policy',
  PayrollSettings = 'Payroll_Settings',
  // … see src/utils/enums.ts
}

enum Permission {
  View   = 'View',
  Create = 'Create',
  Edit   = 'Edit',
  Delete = 'Delete',
}
```

These mirror the backend constants in `Codeji.CMS.Utility.Constraints.AppModule` and `.Permission`. Adding a value here without a matching backend constant will silently fail authorization checks.

## Gating in routes

The component is [`ProtectedRoute.tsx`](../src/app/modules/users/about/components/ProtectedRoute.tsx) (yes, it lives under `users/about/components/` for historical reasons).

```tsx
<ProtectedRoute module={ModulesName.Employees}>
  <Employees />
</ProtectedRoute>

<ProtectedRoute module={ModulesName.Jobs} permission={Permission.Create}>
  <AddEditJob />
</ProtectedRoute>

<ProtectedRoute adminOnly={true}>
  <AdminDashboard />
</ProtectedRoute>
```

Logic:

1. Read `state.user.userData.modulePermission`.
2. Call `hasModuleFeaturePermission(module, permission, modulePermissions)` from [`src/utils/common.ts`](../src/utils/common.ts).
3. On fail → `<Navigate to="/unauthorize" replace />`.

If `permission` is omitted, the check is "user has *any* permission on this module" (effectively "module is visible to user").

## Gating inside a component

When you need to hide a button (e.g. a "Delete" action) but show the rest of the page, do the check inline:

```tsx
import { useAppSelector } from '../../Redux/hooks';
import { hasModuleFeaturePermission } from '../../../utils/common';
import { ModulesName, Permission } from '../../../utils/enums';

const modulePermissions = useAppSelector(s => s.user.userData?.modulePermission ?? []);
const canDelete = hasModuleFeaturePermission(ModulesName.Employees, Permission.Delete, modulePermissions);

return canDelete && <DeleteButton onClick={...} />;
```

Don't compute permissions inside the render path repeatedly — wrap with `useMemo` if the parent re-renders frequently.

## Unguarded routes that should be guarded

As of the snapshot date, the following routes in [`PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx) are mounted *without* a `ProtectedRoute` wrapper. Future contributors should consider whether they need gates:

| Path | Mounted as | Should it be gated? |
|---|---|---|
| `recruitment/*` | `<RecruitmentRoutes />` | Yes — sub-routes have their own gates, but the parent is naked |
| `noticeboard/*` | `<NoticeBoardRoutes />` | Probably not — viewable to all |
| `companypolicy/*` | `<PoliciesRoutes />` | Yes if Policy permission should hide it |
| `profile/*` | `<ProfileRoutes />` | Open to authed users (own profile) — fine |

## Adding a new route

1. **Lazy import** the page component at the top of [`PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx).
2. **Add a `<Route>`** inside the `<Routes>`, wrapping with `<SuspensedView>` and (usually) `<ProtectedRoute>`.
3. **Add the module to the sidebar** if it should appear there: edit `SideBarTabList` in `src/utils/constant/` (or wherever the sidebar config is referenced from `MasterLayout`).
4. **Add an enum entry** in [`src/utils/enums.ts`](../src/utils/enums.ts) under `ModulesName` if the route is permission-gated. The string must match the backend `AppModule` constant.
5. **Add a translation key** for the menu label in every `public/locales/<lang>.json`.

## Adding a new auth flow (e.g. SSO)

- Add the API request to [`_requests.ts`](../src/app/modules/auth/core/_requests.ts).
- Add the form component under [`auth/components/`](../src/app/modules/auth/components/).
- Add a route to [`AuthPage.tsx`](../src/app/modules/auth/AuthPage.tsx).
- On success, store tokens via `setLocalKey()` and dispatch `setAuth()`.
- The user-data fetch will happen automatically on the next mount of `AuthInit`.
