# Add a New Feature: The Playbook

This is the concrete recipe for shipping a new module in CMS-React. Examples assume a hypothetical "Assets" module (tracking laptops / phones issued to employees). Replace `Assets` / `assets` with your real module name.

> Before starting, skim [`conventions.md`](./conventions.md) and [`modules.md`](./modules.md). Most decisions are already made for you — just follow them.

---

## 1. Confirm backend exists

The frontend can't gate access on a module the backend doesn't know about. Before writing UI:

1. The backend repo (`CMS-Backend-Core`) needs an `AppModule` constant for `Assets`.
2. The `Module` collection needs a row for it (covered by `SeedBaseModulesAndPermissions.cs` if you've added the constant before running the seed migration).
3. The backend controller(s) and service(s) for the new endpoints exist.

If those aren't ready, get them done first or coordinate so they land together.

---

## 2. Add the enum entry

Open [`src/utils/enums.ts`](../src/utils/enums.ts) and add to `ModulesName`:

```ts
enum ModulesName {
  // …existing…
  Assets = 'Assets',   // string MUST match backend AppModule.Assets
}
```

If the new module needs a sidebar i18n key, also add to `ModulesTitles`:

```ts
enum ModulesTitles {
  Assets = 'MODULES.ASSETS',
}
```

---

## 3. Add the API endpoint constants

Open [`src/utils/constant/data.ts`](../src/utils/constant/data.ts) and add entries to `ServiceUrl`:

```ts
export const ServiceUrl = {
  // … existing …
  GET_ALL_ASSETS:    'Asset/GetAllAssets',
  GET_ASSET_BY_ID:   'Asset/GetAssetById',
  ADD_ASSET:         'Asset/AddAsset',
  UPDATE_ASSET:      'Asset/UpdateAsset',
  DELETE_ASSET:      'Asset/DeleteAsset',
};
```

Path strings must match the backend `[Route("…")]` and method routes exactly.

---

## 4. Scaffold the module folder

Create the directory and files:

```
src/app/modules/assets/
├── Assets.tsx                # main page
├── AssetsServices.ts         # API calls
├── models.ts                 # TypeScript types
└── components/
    ├── AssetForm.tsx         # add / edit dialog
    ├── AssetFilter.tsx       # filter popover content
    └── AssetList.tsx         # if extracted from Assets.tsx
```

Use existing modules as templates — [`employees/`](../src/app/modules/employees/) is a good reference for a CRUD-shaped module.

---

## 5. Define the models

`src/app/modules/assets/models.ts`:

```ts
export interface AssetModel {
  assetId: string;
  serialNumber: string;
  model: string;
  type: AssetType;
  assignedToUserId: string | null;
  assignedDate: string | null;
  isActive: boolean;
}

export interface AssetFilterModel {
  searchText: string;
  type: AssetType | '';
  isAssigned: boolean | null;
  pageNumber: number;
  pageSize: number;
}

export enum AssetType {
  Laptop = 1,
  Phone = 2,
  Monitor = 3,
}
```

If `AssetType` is referenced anywhere outside this module, hoist it to [`src/utils/enums.ts`](../src/utils/enums.ts) instead.

---

## 6. Write the service

`src/app/modules/assets/AssetsServices.ts`:

```ts
import { getRequest, postRequest, deleteRequest } from '../../../server/axios';
import { ServiceUrl } from '../../../utils/constant/data';
import { ApiResponse, ResponseData } from '../../../utils/common_types';
import { AssetModel, AssetFilterModel } from './models';

export const getAllAssets = (filter: AssetFilterModel) =>
  postRequest<AssetFilterModel, ResponseData<AssetModel>>(
    ServiceUrl.GET_ALL_ASSETS,
    filter,
  );

export const getAssetById = (assetId: string) =>
  getRequest<ResponseData<AssetModel>>(ServiceUrl.GET_ASSET_BY_ID, {
    params: { assetId },
  });

export const saveAsset = (asset: AssetModel) =>
  postRequest<AssetModel, ApiResponse>(ServiceUrl.ADD_ASSET, asset);

export const deleteAsset = (assetId: string) =>
  deleteRequest<ApiResponse>(ServiceUrl.DELETE_ASSET, {
    params: { assetId },
  });
```

Rules: named exports, no try/catch inside, generics on every call. See [`conventions.md` § Service pattern](./conventions.md#service-pattern).

---

## 7. (Optional) Add a Yup schema

If the module has a form, create `src/utils/Schema/assetSchema.ts`:

```ts
import * as Yup from 'yup';

export const assetSchema = Yup.object({
  serialNumber: Yup.string().required('REQUIRED'),
  model:        Yup.string().required('REQUIRED'),
  type:         Yup.number().required('REQUIRED'),
});
```

Reference it from your form's `<Formik validationSchema={assetSchema}>`.

---

## 8. Write the page component

`src/app/modules/assets/Assets.tsx` — follow the layout pattern in [`Employees.tsx`](../src/app/modules/employees/Employees.tsx):

- Page header (`PageData`)
- Filter bar (`SearchInput` + `FilterComponent`)
- Data grid (`CustomDataGrid`)
- Add button (gated by `Permission.Create`)
- Modal for add/edit (`CustomisedModal` containing `<AssetForm />`)
- Confirmation modal for delete (`ConfirmationModal`)

Skeleton:

```tsx
import { FC, useState, useEffect, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useAppSelector } from '../../Redux/hooks';
import { toast } from 'react-toastify';

import { hasModuleFeaturePermission, getCustomStatusCodesErrorMessage } from '../../../utils/common';
import { ModulesName, Permission } from '../../../utils/enums';

import { getAllAssets, deleteAsset } from './AssetsServices';
import { AssetModel, AssetFilterModel } from './models';

const Assets: FC = () => {
  const { formatMessage: i } = useIntl();
  const modulePerms = useAppSelector(s => s.user.userData?.modulePermission ?? []);
  const canCreate = useMemo(
    () => hasModuleFeaturePermission(ModulesName.Assets, Permission.Create, modulePerms),
    [modulePerms],
  );

  const [rows, setRows] = useState<AssetModel[]>([]);
  const [loading, setLoading] = useState(true);
  // … filter state, modal state …

  const load = async (filter: AssetFilterModel) => {
    setLoading(true);
    try {
      const { data } = await getAllAssets(filter);
      if (data.success && data.statusCode === 200) {
        setRows(data.methodResults);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(getCustomStatusCodesErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // … render …
};

export default Assets;
```

---

## 9. Wire up the route

Open [`src/app/routing/PrivateRoutes.tsx`](../src/app/routing/PrivateRoutes.tsx).

Add the lazy import at the top:

```ts
const Assets = lazy(() => import('../modules/assets/Assets'));
```

Add the route inside `<Routes>` (location depends on logical grouping):

```tsx
<Route
  path="assets"
  element={
    <SuspensedView>
      <ProtectedRoute module={ModulesName.Assets}>
        <Assets />
      </ProtectedRoute>
    </SuspensedView>
  }
/>
```

If your module has multiple sub-routes (list / detail / edit), create a `src/app/routing/AssetsRoutes.tsx` and mount it as `<Route path="assets/*" element={<AssetsRoutes />} />`. See [`RecruitmentRoutes.tsx`](../src/app/routing/RecruitmentRoutes.tsx) for a multi-route example.

---

## 10. Add the sidebar entry

Find `SideBarTabList` (or its equivalent in `src/utils/constant/`) and add:

```ts
{
  to: '/assets',
  icon: <LaptopIcon />,
  titleKey: ModulesTitles.Assets,        // 'MODULES.ASSETS'
  module: ModulesName.Assets,            // permission gate for menu visibility
}
```

The sidebar component already filters items the user lacks permission for — no extra work.

---

## 11. Add translations

For each file in [`public/locales/`](../public/locales/) (`en.json`, `de.json`, `es.json`, `fr.json`, `ja.json`, `zh.json`), add the new keys:

```json
{
  "MODULES": { "ASSETS": "Assets" },
  "ASSETS": {
    "TITLE": "Asset Inventory",
    "ADD":   "Add Asset",
    "MODEL": "Model",
    "TYPE":  "Type"
  }
}
```

Adding to `en.json` only is **not enough** — non-English users will see the message ID as a fallback. For new languages you don't speak, copy the English text first and flag the keys for translation later.

> The locale files are served as static assets — see [`data-layer.md` § i18n](./data-layer.md#i18n). After deployment you can edit them directly on the server and refresh the browser; no rebuild needed.

---

## 12. Add to filters slice (only if filters need to persist across routes)

If users will navigate away from `/assets` and back and expect their filter state preserved:

1. Open [`src/app/Redux/Reducers/filterSlice.ts`](../src/app/Redux/Reducers/filterSlice.ts).
2. Add the initial value, action creators, and reducer cases for `assets`.
3. Read/write via `useAppSelector(s => s.filters.assets)` and `dispatch(setAssetsFilter(filter))`.

If filters can reset on navigation, just use `useState` in the page component and skip this step.

---

## 13. Run, test, lint

```bash
npm run typecheck      # catches type mismatches
npm run lint           # catches the easy stuff
npm run dev            # smoke test in browser
```

Manual checks:
- Module appears in the sidebar for users with the permission.
- Module is **hidden** for users without the permission (test with a non-admin login).
- Direct navigation to `/assets` redirects to `/unauthorize` if permission is missing.
- Add / edit / delete round-trips work.
- Filters persist (if you wired them through Redux).
- Translations resolve in at least English; spot-check one other language.

---

## 14. Update the docs

Open [`modules.md`](./modules.md) and add a new section using the existing template. Update the index table at the top of that file too. If the module changes how routing/auth/data work in any non-obvious way, also note it in the relevant cross-cutting doc.

This step is what keeps the docs trustworthy. Skipping it is how docs decay into lies.

---

## Cross-checking checklist (pre-PR)

- [ ] Backend has the `AppModule.Assets` constant + DB row + endpoints
- [ ] Frontend `ModulesName.Assets` matches the backend constant exactly
- [ ] All 5+ `ServiceUrl` paths match backend routes
- [ ] All async calls have try/catch + toast on error
- [ ] Permission-gated buttons hidden when user lacks the permission
- [ ] `<ProtectedRoute>` wraps the page
- [ ] Lazy-loaded with `<SuspensedView>`
- [ ] Sidebar entry added and gated
- [ ] Six locale files updated
- [ ] No `console.log` / `console.error` left behind
- [ ] No `dangerouslySetInnerHTML` without `sanitizeHtmlContent()`
- [ ] No `key={index}` in lists
- [ ] [`modules.md`](./modules.md) updated

---

## Where to look when something doesn't work

| Symptom | Probable cause | File to check |
|---|---|---|
| 401 loop / kicked back to login | Backend doesn't recognize endpoint, or refresh-token endpoint broken | [`src/server/axios.ts`](../src/server/axios.ts) |
| Page renders but data never arrives | Service typo or wrong `ServiceUrl` path | [`src/utils/constant/data.ts`](../src/utils/constant/data.ts) |
| User sees the page but every API call returns 403 | `modulePermission` mismatch — the string in `ModulesName` doesn't match the DB row | [`src/utils/enums.ts`](../src/utils/enums.ts) and backend `AppModule` |
| New language doesn't load | Locale JSON file missing or 404'd | Browser DevTools network tab → `/locales/<lang>.json` |
| All buttons say "BUTTON.SAVE" instead of "Save" | Translation key missing in active locale, no `defaultMessage` provided | The component + the locale JSON |
| Stale data after switching tabs | `useEffect` missing a dep | The component's effects |
| Form won't submit | Yup schema rejects silently or `isValid` stays false | Open DevTools Formik state or print `formik.errors` |
| Modal won't close after save | `onClose` not called in success branch | The form component's submit handler |
