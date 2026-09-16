# Data Layer

Three subsystems live in this layer: **Redux** (client-side state), **axios** (server communication), and **react-intl** (translations served from disk).

---

## Redux

Configured in [`src/app/Redux/store.ts`](../src/app/Redux/store.ts):

```ts
configureStore({
  reducer: {
    user: userReducer,         // signed-in user profile + permissions
    auth: authReducer,         // authentication boolean + token
    filters: filterReducers,   // per-module list-page filter state
    onlineUsers: onlineUsersReducer,  // SignalR presence
  },
});
```

### Slices

| Slice | File | Shape | Notes |
|---|---|---|---|
| `auth` | [`Reducers/authSlice.ts`](../src/app/Redux/Reducers/authSlice.ts) | `{ isUserAuthenticated: boolean, token: string \| null }` | Actions: `setAuth`, `setToken`, `logout` |
| `user` | [`Reducers/userSlice.ts`](../src/app/Redux/Reducers/userSlice.ts) | `{ userData: UserModel \| null }` | Actions: `setCurrentUser`, `clearUserData`. Selectors: `getUser`, `getUserRoleType`, `getModulePermissions` |
| `filters` | [`Reducers/filterSlice.ts`](../src/app/Redux/Reducers/filterSlice.ts) | `{ application, jobs, processLog, employee, holiday, noticeBoard, leaveRequest }` | One sub-state per module. Each has its own `set<X>Filter` and `clear<X>Filter` action |
| `onlineUsers` | [`Reducers/onlineUsersSlice.ts`](../src/app/Redux/Reducers/onlineUsersSlice.ts) | online presence | Updated by SignalR hub events |

### Hooks

Always use the typed wrappers from [`src/app/Redux/hooks.ts`](../src/app/Redux/hooks.ts):

```ts
const dispatch = useAppDispatch();
const userData = useAppSelector(s => s.user.userData);
```

Don't import `useDispatch`/`useSelector` directly from `react-redux` — you lose the type information.

### When to use Redux vs local state

Use Redux for:
- The signed-in user (one source of truth across the app).
- The active language (also via the i18n context, but the user record drives the initial value).
- List-page filters that should survive route changes (`filters` slice exists for exactly this).
- SignalR online-user presence.

Use `useState`/`useReducer` for:
- Form state (Formik handles this; no slice needed).
- Modal open/close, expanded/collapsed.
- Anything scoped to a single component tree.

> **Don't add a slice for every module's data.** Most modules fetch on mount and store results in local state. Only escalate to Redux when state must be shared between components that don't share a parent.

---

## Axios

Configured in [`src/server/axios.ts`](../src/server/axios.ts).

### Instance

```ts
axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  timeout: 30_000,
});
```

`timeout: 30_000` is generous — slow APIs hide behind it. Don't reduce without checking the worst-case backend endpoint (PDF generation, payroll batch).

### Request helpers (use these — don't call `axios` directly)

```ts
import {
  getRequest, postRequest, patchRequest, putRequest, deleteRequest,
} from '../../../server/axios';

await getRequest<ResponseData<EmployeeModel>>(ServiceUrl.GET_EMPLOYEE_DETAILS, {
  params: { employeeId },
});

await postRequest<InviteNewEmployeeModel, ApiResponse>(
  ServiceUrl.INVITE_NEW_EMPLOYEE,
  payload,
);

// File upload
await postRequest<FormData, ApiResponse>(
  ServiceUrl.UPLOAD_RESUME,
  formData,
  /* config */ {},
  /* isFormData */ true,
);
```

The helpers handle:
- JSON / multipart content-type switching (`isformData` flag on `postRequest`).
- Cache-control header on `GET`.
- Both generics: request body type and response type.

### Interceptors

| Stage | What |
|---|---|
| Request | Inject `Authorization: Bearer <token>` from `localStorage` (`kt-auth-react-v`). Inject `Accept-Language: <lang>`. If unauthenticated and `cId` is set in `localStorage` (career portal), inject as `cId` header. |
| Response (200/4xx) | Pass through. |
| Response (401) | Trigger token refresh (see below). |

### Token refresh flow

```
request → 401 → if !isRefreshing { isRefreshing = true; await refreshTokenAsync() }
                else                 enqueue this request, wait for refresh to complete
              ↓
       on refresh success: setLocalKey(newTokens), retry original + dequeue queued requests
       on refresh failure: localStorage.clear(), navigate('/auth')
```

**Single-flight guarantee**: only one refresh request fires per token, even if 50 requests fail with 401 simultaneously. Implemented via `isRefreshing` flag + `failedRequestQueue` array.

### `ServiceUrl` registry

All endpoint paths are constants in [`src/utils/constant/data.ts`](../src/utils/constant/data.ts), exported as `ServiceUrl`. **Never inline a URL** in a service file — add a constant.

```ts
export const ServiceUrl = {
  // Auth
  USER_LOGIN: 'Account/Login',
  REFRESH_TOKEN: 'Account/RefreshToken',
  REGISTER_COMPANY: 'Account/Register',
  // Employees
  GET_ALL_EMPLOYEE: 'Employee/GetAllEmployee',
  INVITE_NEW_EMPLOYEE: 'Employee/InviteNewEmployee',
  // ... ~80 more
};
```

Why: easier to grep "what endpoints exist", easier to swap one path globally, easier to mock in tests.

### Standard service shape

```ts
// src/app/modules/employees/employeeServices.ts
import { getRequest, postRequest, deleteRequest } from '../../../server/axios';
import { ServiceUrl } from '../../../utils/constant/data';
import { ApiResponse, ResponseData } from '../../../utils/common_types';
import { EmployeeModel, InviteNewEmployeeModel } from './models';

export const getAllEmployees = (payload: GetAllEmployeesFilter) =>
  postRequest<GetAllEmployeesFilter, ResponseData<EmployeeModel>>(
    ServiceUrl.GET_ALL_EMPLOYEE,
    payload,
  );

export const deleteEmployee = (employeeId: string) =>
  deleteRequest<ApiResponse>(ServiceUrl.DELETE_EMPLOYEE, {
    params: { employeeId },
  });
```

Service functions:
- Are **named exports** (no default export of a "service object").
- Return the `axios.AxiosResponse` directly — they don't try/catch internally.
- Always type both generics.
- Don't unwrap `data` — the caller does.

### Standard component-side error handling

```tsx
import { toast } from 'react-toastify';
import { getCustomStatusCodesErrorMessage } from '../../../utils/common';

const handleSubmit = async () => {
  setLoading(true);
  try {
    const { data } = await getAllEmployees(payload);
    if (data.success && data.statusCode === 200) {
      setEmployees(data.methodResults);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(getCustomStatusCodesErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

Don't swallow errors silently. If you have a reason to (rare), still log via `console.error`.

### Response shape contract

The backend returns one of two shapes — both modeled in [`src/utils/common_types.ts`](../src/utils/common_types.ts):

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

A list endpoint populates `methodResults`; a single-record endpoint populates `methodResult`. Always check `data.success && data.statusCode === 200` before reading either — a `400` with `success: false` still resolves the promise (only network errors and `401` go to `catch`).

---

## i18n

### Files

The locale JSONs live in [`public/locales/`](../public/locales/):

```
public/locales/
├── en.json
├── de.json
├── es.json
├── fr.json
├── ja.json
└── zh.json
```

These are static assets — Vite copies them verbatim to `dist/locales/` at build time. **Edit them on the server with any text editor and refresh the page; no rebuild needed.**

### How they are loaded

[`src/_themes/i18n/i18nProvider.tsx`](../src/_themes/i18n/i18nProvider.tsx) fetches the active locale at runtime:

```ts
fetch(`/locales/${currentLanguage}.json`, { cache: 'no-cache' })
```

- `cache: 'no-cache'` forces a conditional request on every load (`If-None-Match` / `If-Modified-Since`). Server returns `304` for unchanged files (cheap), `200` for edited files (your changes propagate immediately).
- Loaded messages are cached **in memory** per session, so switching `EN → FR → EN` only re-fetches twice.
- A `latestRequestRef` guards against race conditions when the user switches languages quickly.
- Until the first fetch resolves, `<I18nProvider>` renders `null` (avoids a flash of message-IDs).

### Server-side requirement

For `cache: 'no-cache'` to be efficient, the static-file server must send `ETag` or `Last-Modified` so the browser can issue a conditional request. nginx, Azure Static Web Apps, IIS, and S3+CloudFront all do this by default. If you see full re-downloads, check that response headers include one of these.

### Language switching

Driven by a separate context in [`Metronici18n.tsx`](../src/_themes/i18n/Metronici18n.tsx):

```ts
const { currentLanguage, changeAppLanguage } = useAppLang();
changeAppLanguage(LANGUAGE.FRENCH);
```

`changeAppLanguage`:
- Updates context state (triggers re-fetch in `i18nProvider`).
- Persists choice via `setAppLanguage()` (writes to `localStorage` under key `i18nConfig`, see `VITE_APP_I18N_CONFIG_KEY`).

The initial language comes from:
1. `localStorage[i18nConfig]` if set, else
2. `userData.defaultLanguage` (set by `AuthInit` after login), else
3. `LANGUAGE.ENGLISH`.

### Using translations in components

```tsx
import { useIntl, FormattedMessage } from 'react-intl';

const { formatMessage: i } = useIntl();
const placeholder = i({ id: 'FORM.EMAIL' });

return (
  <>
    <FormattedMessage id="FORM.EMAIL" defaultMessage="Email" />
    <input placeholder={placeholder} />
  </>
);
```

Always include `defaultMessage` on `<FormattedMessage>` so the UI degrades gracefully if a key is missing in the loaded locale.

### Adding a new translation key

1. Add the key to **all six** files in [`public/locales/`](../public/locales/). Missing keys silently fall back to the key itself in non-English locales.
2. Use dotted paths for grouping — the loader flattens them via `flattenMessages` in [`src/utils/common.ts`](../src/utils/common.ts).
3. Reference the new key in the component with `<FormattedMessage id="NEW.KEY" defaultMessage="..." />`.

### Adding a new language

1. Add a value to `enum LANGUAGE` in [`src/utils/enums.ts`](../src/utils/enums.ts).
2. Add the locale-data import to [`src/_themes/i18n/i18nProvider.tsx`](../src/_themes/i18n/i18nProvider.tsx) (it's a one-line `@formatjs/intl-relativetimeformat/locale-data/<lang>`).
3. Add the locale to the MUI mapping in [`themePalettes.ts`](../src/app/modules/theme/themePalettes.ts) (`getCurrentLocaleForMui`).
4. Add the dayjs locale import in [`src/utils/common.ts`](../src/utils/common.ts) (`setDayJsLocale`).
5. Drop a JSON file at `public/locales/<lang>.json`.
6. Add the language string to the backend `Languages` constants — see backend `Codeji.CMS.Utility.Constraints.Languages` — and rerun the company-defaults seed if you want default departments / job titles in the new language.

---

## SignalR (realtime)

Notifications received through the authenticated SignalR connection update the header notification list and trigger a global TanStack Query refresh for cached API reads. This keeps older screens that still use imperative `getRequest`/`fetchQuery` calls synchronized when another user submits leave or changes an HR workflow. Reconnect performs the same refresh, and stale queries refresh when the browser tab regains focus. The API remains the source of truth; SignalR is only the realtime refresh hint.

[`@microsoft/signalr`](https://www.npmjs.com/package/@microsoft/signalr) connects after auth completes. It's used for:
- Online-user presence → updates `onlineUsers` slice.
- (Likely) chat / notifications. Search `chatHubInstance` in [`App.tsx`](../src/app/App.tsx) for the wiring.

If you add a new realtime feature, register the hub event handler at the same place existing handlers are wired up, and dispatch a Redux action on receipt rather than calling component setters directly (presence may go stale by the time a component is unmounted).
