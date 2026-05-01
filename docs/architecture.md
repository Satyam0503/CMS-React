# Architecture

## What this app is

A multi-tenant HR / company management SPA. Single deployment serves multiple companies; the company context is established at login and travels with every request via a JWT.

## Tech stack

| Concern | Choice |
|---|---|
| UI framework | React 18 + TypeScript |
| Build / dev server | Vite 5 + `@vitejs/plugin-react-swc` |
| UI components | MUI 7 (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-charts`) |
| Styling | Emotion (CSS-in-JS) + Sass for global styles |
| Routing | `react-router-dom` 6 |
| State | Redux Toolkit 2 + `react-redux` 9 |
| Forms | Formik 2 + Yup |
| HTTP | axios with request/response interceptors |
| i18n | `react-intl` 6, locale JSONs fetched at runtime from `/locales/*.json` |
| Realtime | `@microsoft/signalr` 8 (online users, chat) |
| Charts | `apexcharts` + MUI X-Charts |
| Date math | dayjs (locale-aware) |
| Toasts | `react-toastify` |
| Tests | Vitest + jsdom |

Full version pinning is in [package.json](../package.json).

## Top-level folder layout

```
CMS-React/
├── public/
│   └── locales/              # i18n JSON files served as static assets
├── src/
│   ├── main.tsx              # React entry point — renders <AppRoutes />
│   ├── app/
│   │   ├── App.tsx           # Theme + i18n + auth providers
│   │   ├── routing/          # AppRoutes, PrivateRoutes, per-module route trees
│   │   ├── modules/          # Feature modules (one folder per business domain)
│   │   ├── shared/           # Reusable UI components & layout pieces
│   │   └── Redux/            # Store, slices, hooks
│   ├── _themes/
│   │   ├── i18n/             # IntlProvider + language context
│   │   ├── layout/           # MasterLayout (header / sidebar / footer)
│   │   └── assets/sass/      # Global styles
│   ├── server/
│   │   └── axios.ts          # HTTP client + interceptors
│   └── utils/
│       ├── common.ts         # Helpers (date, permissions, error mapping)
│       ├── enums.ts          # Application-wide enums
│       ├── common_types.ts   # Shared TS types
│       ├── constant/data.ts  # ServiceUrl + constants (BaseUrl, storage keys)
│       └── Schema/           # Yup validation schemas, one per form domain
├── docs/                     # You are here
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Request lifecycle

How a typical authenticated request flows from a button click to a rendered table:

1. **Component handler** calls a service function — e.g. `getAllEmployees(payload)`.
2. **Service** ([`employeeServices.ts`](../src/app/modules/employees/employeeServices.ts) and similar) calls one of the helpers from [`src/server/axios.ts`](../src/server/axios.ts): `getRequest`, `postRequest`, `patchRequest`, `putRequest`, `deleteRequest`. The URL is a constant from [`ServiceUrl`](../src/utils/constant/data.ts).
3. **Request interceptor** in [`axios.ts`](../src/server/axios.ts) attaches:
   - `Authorization: Bearer <token>` from `localStorage` (key `kt-auth-react-v`)
   - `Accept-Language: <currentAppLanguage>`
   - For unauthenticated routes: `cId` header carrying the company ID stored on the public career page.
4. **Backend** processes the request (separate repo).
5. **Response interceptor**:
   - On `200 / 4xx (≠ 401)` → resolves the promise; component handles `data.success` flag.
   - On `401` → calls `refreshToken()`, retries the original request once. Concurrent 401s are queued so only one refresh fires. Failure → `localStorage.clear()` + redirect to `/auth`.
6. **Component** inspects `data.success && data.statusCode === 200` and either updates state or shows a `toast.error(data.message)`. Network errors are caught in `try/catch` and converted via `getCustomStatusCodesErrorMessage()`.

The end-to-end pattern is repeated almost verbatim in every feature module — see [`conventions.md`](./conventions.md) for the canonical snippet.

## App bootstrap order

1. [`main.tsx`](../src/main.tsx) renders `<AppRoutes />` inside a Redux `<Provider store={store} />`.
2. [`AppRoutes.tsx`](../src/app/routing/AppRoutes.tsx) wraps the tree in `<BrowserRouter>` and decides between **public** (auth, error pages, public career portal) and **protected** routes based on `state.auth.isUserAuthenticated`.
3. [`App.tsx`](../src/app/App.tsx) installs the MUI theme (`createApplicationTheme` from [`MuiTheme.ts`](../src/app/modules/theme/MuiTheme.ts)), the Metronic i18n context, the Intl provider that fetches the active locale from `/locales/<lang>.json`, the toast container, and the SignalR hub connection (after auth).
4. [`Auth.tsx`](../src/app/modules/auth/core/Auth.tsx) (`AuthInit`) — if a token exists, calls `getSignedUserDetails()`, dispatches `setCurrentUser` + `setAuth`, sets the dayjs/MUI/i18n locale from `userData.defaultLanguage`, then unblocks the splash screen. Failures redirect to `/logout`.
5. Once authenticated, [`PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx) mounts `<MasterLayout />` and the lazy-loaded module tree under it.

## Multi-tenancy model

- Each user belongs to **exactly one company**.
- The JWT carries the company ID; the backend enforces tenant isolation on every query.
- Frontend stores no company ID separately — it is implicit in the token.
- Company-default lookups (departments, job titles, mail templates) are seeded server-side at company registration. See backend repo for `CompanyService.Register()` and `DefaultCompanySeeds.cs`.

## Permission model

- A user's **roleType** (`Administrator`, `HRManager`, `Employee`) drives high-level access.
- Granular feature access is governed by an array of **module permissions** stored on the user record (`userData.modulePermission`) — each entry pairs a module (`ModulesName.Employees`, etc.) with a permission (`Permission.View | Create | Edit | Delete`).
- The frontend enforces the same checks the backend does, via:
  - Route gating: [`<ProtectedRoute>`](../src/app/modules/users/about/components/ProtectedRoute.tsx)
  - In-component: `hasModuleFeaturePermission(module, permission, modulePermissions)` from [`src/utils/common.ts`](../src/utils/common.ts)

Detail in [`routing-and-auth.md`](./routing-and-auth.md).

## Build, test, lint

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR (default port 5173) |
| `npm run build` | `tsc` (type-check) → `vite build` → outputs to `dist/` |
| `npm run typecheck` | Type check only (no emit) |
| `npm run lint` | ESLint with `--report-unused-disable-directives` |
| `npm run format` | Prettier write-mode |
| `npm run test` | Vitest one-shot run |

Vite config is intentionally minimal — see [vite.config.ts](../vite.config.ts). The only non-default is `chunkSizeWarningLimit: 3000` (suspicious — would catch genuine bundle bloat at the default 500 kB).

## Environment variables

All env vars must be prefixed with `VITE_` to be exposed to client code.

| Var | Purpose | Example |
|---|---|---|
| `VITE_BASEURL` | Backend API base URL | `http://localhost:5036` |
| `VITE_CAPTCHA_SITE_KEY` | Google reCAPTCHA v2/v3 site key | `6Le...` |
| `VITE_APP_I18N_CONFIG_KEY` | localStorage key for chosen language | `i18nConfig` |

`.env.example` lists the full set. Production values come from CI secrets.

## What lives where (cheat sheet)

| You're touching… | Open… |
|---|---|
| A specific module | `src/app/modules/<name>/` |
| Adding a route | `src/app/routing/PrivateRoutes.tsx` (or a per-module routes file) |
| API endpoint constant | [`src/utils/constant/data.ts`](../src/utils/constant/data.ts) → `ServiceUrl` |
| Shared TS type | [`src/utils/common_types.ts`](../src/utils/common_types.ts) |
| Enum | [`src/utils/enums.ts`](../src/utils/enums.ts) |
| Validation | `src/utils/Schema/<feature>Schema.ts` |
| Reusable component | [`src/app/shared/components/`](../src/app/shared/components/) |
| Theme / colors | [`src/app/modules/theme/MuiTheme.ts`](../src/app/modules/theme/MuiTheme.ts) + [`themePalettes.ts`](../src/app/modules/theme/themePalettes.ts) |
| i18n string | `public/locales/<lang>.json` (edit on server, no rebuild) |
| Axios behavior | [`src/server/axios.ts`](../src/server/axios.ts) |
| Redux slice | `src/app/Redux/Reducers/<name>Slice.ts` |
