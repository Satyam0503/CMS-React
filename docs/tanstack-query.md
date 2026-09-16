# TanStack Query in CMS-React

This guide documents the implementation in this repository: what TanStack Query does, how it works with Axios and Redux, and how to extend it safely.

## Responsibilities

TanStack Query manages **server state**: API data that may be cached, shared, retried, refreshed, or invalidated. It does not replace Redux, Axios, or local component state.

| Layer | Responsibility |
| --- | --- |
| Component state | Forms, dialogs, selections, filters, and temporary UI state |
| Redux | Authentication and shared client/application state |
| TanStack Query | Server-state cache, request deduplication, retries, and invalidation |
| Axios | HTTP transport, auth/language headers, timeout, and token refresh |
| Backend | Source of truth |

## Implementation files

| File | Purpose |
| --- | --- |
| `src/main.tsx` | Installs `QueryClientProvider` for the React tree |
| `src/app/query/queryClient.ts` | Global cache and retry configuration |
| `src/app/query/queryKeys.ts` | Stable cache-key namespaces and the global API-key factory |
| `src/server/axios.ts` | Routes shared GET calls through the cache and invalidates after writes |
| `src/app/modules/dashboard/dashboardQueries.ts` | Feature-specific `queryOptions` and `useQuery` examples |
| `src/app/modules/auth/Logout.tsx` | Clears cached server state on logout |

## Startup and provider

`src/main.tsx` installs one client above the existing Redux provider and routes:

```tsx
<QueryClientProvider client={queryClient}>
  <Provider store={store}>
    <AppRoutes />
  </Provider>
</QueryClientProvider>
```

The client is created once at module scope. Do not create it inside a component, because that would discard the cache on rerender.

## Global defaults

`queryClient.ts` configures:

| Option | Value | Effect |
| --- | --- | --- |
| `staleTime` | 30 seconds | Matching requests reuse successful fresh data without another network call. |
| `gcTime` | 30 minutes | Unused entries remain in memory for up to 30 minutes. |
| Query retries | Maximum 2 | Transient/network failures can retry; HTTP 4xx failures do not. |
| `refetchOnWindowFocus` | `true` | Returning to an inactive tab refreshes stale server data changed by another user. |
| `refetchOnReconnect` | `true` | Stale active data can refresh when connectivity returns. |
| Mutation retries | `false` | Writes are not repeated automatically. |

Mutation retries are deliberately disabled because repeating a write may create duplicate records or actions.

## Project-wide GET flow

Most feature services use `getRequest` from `src/server/axios.ts`. That helper transparently uses TanStack Query while keeping the original `Promise<AxiosResponse<T>>` contract.

```text
Component
  -> feature service
  -> getRequest(path, config)
  -> queryClient.fetchQuery(...)
  -> cache lookup
       fresh: return cached AxiosResponse
       missing/stale: execute Axios request
  -> Axios request interceptor
  -> API
```

Existing code remains valid:

```ts
const { data } = await getAllEmployees(payload);
```

If multiple callers request the same key while a request is running, TanStack Query shares the in-flight promise. This prevents duplicate API calls.

Axios still adds the bearer token and `Accept-Language`, handles timeouts, refreshes expired tokens, and queues concurrent 401 requests. TanStack Query does not bypass any interceptor.

## Writes and invalidation

POST, PUT, PATCH, and DELETE still execute through Axios. After a successful response, the shared helper calls:

```ts
queryClient.invalidateQueries();
```

Invalidation marks cached server state stale. Shared writes invalidate the cache after a successful response. SignalR notification and reconnect events use `refetchType: "all"` so imperative `fetchQuery` screens also actively reload; this is important for admin screens that remain open while an employee submits leave or another workflow changes data. Failed writes do not invalidate the cache.

Global invalidation is a compatibility safety net while older screens retain their current request lifecycles. Native feature mutations should eventually use targeted invalidation.

## Cache keys

Shared GET calls use this structure:

```ts
["api", authScope, language, path, params]
```

- `"api"` is the root namespace.
- `authScope` is a non-token hash separating authenticated sessions.
- `language` separates localized responses.
- `path` separates endpoints.
- `params` separates pagination, search, filters, and other variants.

Example:

```ts
[
  "api",
  "accountHash",
  "en",
  "/api/employees",
  { pageNo: 1, records: 10, search: "sam" }
]
```

Every input that changes the response must be represented in its key. Keys must contain stable, serializable data. Never put functions, DOM nodes, class instances, or access tokens in a key.

The account scope and language prevent data from being reused for another user or locale. Logout also calls `queryClient.clear()` to immediately remove all cached server data.

## Cancellation

TanStack provides an `AbortSignal` to the query function. `getRequest` forwards it to Axios unless the caller already provided one:

```ts
signal: config?.signal ?? signal
```

This supports query cancellation without breaking explicit cancellation in existing services.

## Native feature hooks

New or migrated modules should define query options beside their service layer. The dashboard is the current example:

```ts
export const dashboardQueryOptions = {
  gender: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.gender,
      queryFn: async () => (await getAllGenderInfo()).data,
    }),
};

export const useGenderQuery = () =>
  useQuery(dashboardQueryOptions.gender());
```

A component consumes it with:

```tsx
const { data, isPending, isFetching, isError, error } = useGenderQuery();
```

Query-option factories provide one strongly typed key and function for hooks, prefetching, invalidation, and tests. They also remove manual request lifecycle state and request-oriented `useEffect` code.

The dashboard service still uses `getRequest`, so native feature queries and transparent global caching remain compatible during gradual migration.

## Adding a read query

First add key factories in `queryKeys.ts`:

```ts
employees: {
  all: ["employees"] as const,
  list: (filters: EmployeeFilters) =>
    ["employees", "list", filters] as const,
  detail: (employeeId: string) =>
    ["employees", "detail", employeeId] as const,
},
```

Then define options and a hook:

```ts
export const employeeListOptions = (filters: EmployeeFilters) =>
  queryOptions({
    queryKey: queryKeys.employees.list(filters),
    queryFn: async () => (await getAllEmployees(filters)).data,
  });

export const useEmployeesQuery = (filters: EmployeeFilters) =>
  useQuery(employeeListOptions(filters));
```

Rules:

1. Include every response-changing input in the key.
2. Keep HTTP functions in service files.
3. Return useful response data from the query function.
4. Use `enabled` when a required identifier may be missing.
5. Handle initial loading, errors, and empty results deliberately.
6. Do not copy query data into component state unless creating an editable draft.

```ts
useQuery({
  ...employeeDetailOptions(employeeId!),
  enabled: Boolean(employeeId),
});
```

## Adding a mutation

Prefer `useMutation` for migrated write flows:

```ts
const queryClient = useQueryClient();

const updateEmployeeMutation = useMutation({
  mutationFn: updateEmployee,
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.employees.all,
    });
  },
});

await updateEmployeeMutation.mutateAsync(payload);
```

Use targeted invalidation for native feature queries. Do not enable write retries unless the backend operation is explicitly idempotent.

## Query states

| State | Meaning and UI guidance |
| --- | --- |
| `isPending` | No successful data exists yet. Show the existing initial skeleton. |
| `isFetching` | A request is running, possibly in the background. Keep showing cached data. |
| `isError` | The request failed and no usable data is available. |
| `error` | Axios or JavaScript error value. |
| `data` | Cached successful data. |

Do not replace a populated screen with a full loader merely because `isFetching` is true. Use `isPending` for initial loading and a subtle indicator for background refresh if needed.

## What is and is not cached

Cached:

- GET calls made through `getRequest`.
- Native `useQuery` results.
- Successful query data for the configured lifetime.

Not cached:

- POST, PUT, PATCH, or DELETE responses.
- Redux state or component state.
- Forms and editing drafts.
- SignalR messages, unless a handler explicitly updates or invalidates a query.

For a feature-specific SignalR event that changes server data, invalidate the relevant namespace. The global notification handler already performs a compatibility refresh for older screens:

```ts
void queryClient.invalidateQueries({ refetchType: "all" });
```

This refreshes cached API reads without clearing authentication or local form state. A notification is persisted and delivered by the backend; the realtime event is a refresh hint, not the source of truth. Reconnect performs the same refresh to cover changes made while the connection was unavailable.

## Tests

The current tests cover:

- No retries for HTTP 4xx errors.
- Bounded retries for transient failures.
- Dashboard service execution through query options.
- Reuse of fresh cached data.
- Isolation of dashboard resource keys.
- API-key isolation by account, language, endpoint, and parameters.

Test files:

- `src/app/query/queryClient.test.ts`
- `src/app/query/queryKeys.test.ts`
- `src/app/modules/dashboard/dashboardQueries.test.ts`

Create a fresh `QueryClient` per test with retries disabled. Do not share the production singleton between tests that mutate cache state.

## Debugging

For stale or incorrect data:

1. Confirm the request uses `getRequest` or a native query.
2. Ensure every response-changing input is in the key.
3. Confirm successful writes invalidate the relevant query.
4. Remember that data stays fresh for 30 seconds unless a successful write, notification event, reconnect, or window-focus refetch makes it stale/refreshes it sooner.
5. Confirm the account and language produce distinct global keys.
6. Check Axios interceptors and the browser network request.

For duplicate requests:

1. Confirm both calls produce exactly the same key.
2. Ensure parameter objects contain equivalent serializable values.
3. Check whether one request bypasses the shared helper.
4. Remember that stale data is allowed to refetch.

## Current migration status

The project uses a safe hybrid model:

- All shared GET requests receive caching and deduplication through `getRequest`.
- All shared writes invalidate server-state cache.
- Dashboard gender, department, upcoming-event, and celebration cards use native hooks.
- Other components retain their existing service calls and UI behavior while receiving transparent global cache benefits.

Migrate remaining modules to native hooks feature by feature. Validate pagination, filters, loading behavior, mutations, SignalR events, and invalidation for each screen instead of mechanically replacing every `useEffect`.
