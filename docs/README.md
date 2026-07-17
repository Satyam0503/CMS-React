# CMS-React Docs

Architectural reference for the **CMS-React** frontend. Written for AI agents and humans who need to ramp up on the codebase without re-exploring it from scratch.

> **Snapshot date:** 2026-05. File paths and conventions reflect the codebase at that time. If a path no longer resolves, prefer reading the actual source over trusting the doc.

## How to use these docs

For the frontend server-state implementation, read [`tanstack-query.md`](./tanstack-query.md). It documents the global Axios cache, query keys, invalidation, retries, authentication isolation, feature hooks, tests, and migration guidance.

If you only have time to read **one** file, read [`modules.md`](./modules.md) — it's the catalog of every feature in the app. Everything else exists to support adding to or modifying that catalog.

Recommended reading order for a new contributor (human or AI):

1. [`architecture.md`](./architecture.md) — tech stack, request lifecycle, folder layout
2. [`modules.md`](./modules.md) — what the app does, module by module
3. [`routing-and-auth.md`](./routing-and-auth.md) — how URLs map to modules and how access is gated
4. [`data-layer.md`](./data-layer.md) — Redux, axios helpers, `ServiceUrl` constants, i18n
5. [`ui-patterns.md`](./ui-patterns.md) — MUI theme, shared components, forms
6. [`conventions.md`](./conventions.md) — file naming, error handling, response shape
7. [`add-new-feature.md`](./add-new-feature.md) — the playbook for shipping a new module

## What this is not

- Not a tutorial. Assumes you know React, TypeScript, Redux Toolkit, MUI, Formik, react-intl, axios.
- Not generated. Update by hand when you add a module or change a cross-cutting pattern.
- Not exhaustive of every component. The shared components list in [`ui-patterns.md`](./ui-patterns.md) is the catalog; individual feature components are listed under each module in [`modules.md`](./modules.md).

## When to update these docs

- **Adding a new module** → add a section to [`modules.md`](./modules.md) and list the route in [`routing-and-auth.md`](./routing-and-auth.md).
- **Adding a new shared component** → add to the catalog in [`ui-patterns.md`](./ui-patterns.md).
- **Changing an axios interceptor, auth flow, Redux slice, or i18n loader** → update [`data-layer.md`](./data-layer.md) (and [`routing-and-auth.md`](./routing-and-auth.md) if auth-related).
- **Renaming, moving, or deleting a file referenced here** → search this folder for the old path and replace.

## Companion: backend docs

This repo only documents the **frontend**. The .NET backend lives in a sibling repo (`CMS-Backend-Core`). When implementing a feature that needs new API endpoints, also create / modify the corresponding controller, service, and DTO there.
