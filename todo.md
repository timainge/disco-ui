# disco-ui refactor — progress tracker

Source spec: `disco-ui-refactor.md` (on `origin/main`)

## Completed

- [x] Create `src/lib/config.ts` and update `.env.example`
- [x] Rewrite `src/lib/api.ts` — apiFetch wrapper, updated interfaces, real endpoints
- [x] Update `src/hooks/queries.ts` — update existing hooks, add new hooks
- [x] Update `src/screens/Dashboard.tsx` — use `stats.by_category`, `stats.stale`, `stats.last_classified_at`
- [x] Update `src/screens/Cases.tsx` — single-matter model with `useMatter`
- [x] Update `src/components/cases/NewCaseWizard.tsx` — PATCH matter, real ingest polling
- [x] Update `src/screens/Index.tsx` — server-side pagination, API search, facets, `addressee` column
- [x] Rewrite `src/screens/Bundle.tsx` — real box/category tree, validate + export flow
- [x] Update `src/components/review/MetadataPanel.tsx` — `addressee`, `privilege_type`, `is_stale` badge
- [x] Update `src/components/review/BundleTree.tsx` and `DocumentList.tsx` — new `SearchResultResponse[]` shape
- [x] Add `src/vite-env.d.ts` — Vite client types for `import.meta.env`

---

## Review findings — next tasks

### 🔴 Bugs

- [ ] **`Bundle.tsx`: Export button calls `handleValidate` instead of exporting**
  - The "Export Bundle" button's `onClick` is `() => { handleValidate().then(() => {}) }` — it
    just re-runs validation. The button should either trigger `setShowConfirmExport(true)` when
    validation has already passed, or call `handleExport()` directly. Restructure the two-button
    flow: "Validate" pre-flight check, then "Export Bundle" only enabled after passing validation.

- [ ] **`Index.tsx`: Redundant `useDocuments` call when search is active**
  - `useDocuments(debouncedQuery ? undefined as any : docFilters)` — when search is active the
    `undefined as any` bypasses the type and silently calls `GET /api/documents` with no filters
    (hits the server's default page). Should add an `enabled` option to `useDocuments` hook and
    pass `enabled: !debouncedQuery` to skip the call entirely during search.

- [ ] **`useIngestJob`: polling stops on first network error**
  - `refetchInterval: (q) => q.state.data?.status === 'running' ? 1000 : false` — if the first
    fetch fails, `data` is undefined so polling halts. Fix: `(!status || status === 'running') ? 1000 : false`
    so it keeps retrying through transient errors.

---

### 🟠 Hardcoded / stale data in live components

- [ ] **`TopNav`: hardcoded matter name and review stats**
  - Line 27: `"Smith v Jones — 2024/042"` — should come from `useMatter()`.
  - Lines 50–53: `"847/1247 reviewed (68%)"` and `"23 unreviewed"` are literal strings — should
    be driven by `useStats()`. These are visually prominent and actively misleading once the real
    backend is connected.

- [ ] **`TopNav`: tab label still says "Cases"**
  - The tab `{ id: 'cases', label: 'Cases' }` should be `label: 'Matter'` to match the renamed screen.

- [ ] **`DocumentPreview.tsx`: email "To:" field uses stale `metadata?.to`**
  - Line 116 renders `docDetail.metadata?.to` for the "To:" row. `addressee` is now a first-class
    field on `DocumentDetail` and should be preferred: `docDetail.addressee ?? docDetail.metadata?.to`.

- [ ] **`NewCaseWizard.tsx`: `queries` field collected but never sent**
  - Step 3 renders a "Queries & Keywords" textarea and binds it to `queries` state, but
    `startIngest()` only sends `{ source, from_date, to_date }`. Either wire the field to the API
    (if the endpoint gains a `queries` param) or remove it from the UI to avoid misleading users.

---

### 🟡 Composition / architecture

- [ ] **`AdvancedFilters.tsx` is dead code — consolidate with `ServerAdvancedFilters`**
  - `src/components/index/AdvancedFilters.tsx` is no longer imported anywhere. The replacement
    (`ServerAdvancedFilters`) is an inline component at the bottom of `Index.tsx`. Plan:
    1. Delete `AdvancedFilters.tsx`.
    2. Move `ServerAdvancedFilters` into `src/components/index/AdvancedFilters.tsx` with a clean
       props interface (server-state setters, not a TanStack `Table` object).
    3. Remove the unused `import { AdvancedFilters }` from `Index.tsx` (currently dead import, line 5).

- [ ] **`Timeline.tsx` should use `useTimeline`, not `useDocuments`**
  - Currently fetches all documents via `useDocuments()` and does client-side sort + grouping.
    We added `useTimeline` / `GET /api/timeline` specifically for this. Switch to it: the API
    already returns documents sorted chronologically and the date grouping can happen from that
    response. Removes a large unnecessary data load.

- [ ] **`isDarkMode` should live in Zustand, not `App.tsx` local state**
  - Currently local state in `App.tsx`, prop-drilled to `TopNav`. This means the preference resets
    on full remount and is inaccessible from any other component. Move to the Zustand store
    (`useStore`) and persist to `localStorage` via `zustand/middleware/persist`. The store already
    controls `activeTab` and `selectedDocId`; dark mode fits there too.

- [ ] **Extract `useDocumentSearch` hook to eliminate duplication in `BundleTree` + `DocumentList`**
  - Both components repeat the same pattern:
    ```ts
    const { data: searchResults } = useSearchDocuments(query);
    const documents = query
      ? (searchResults?.map(r => r.document) ?? [])
      : (docsData?.items ?? []);
    ```
    Extract a `useDocumentSearch(query: string): Document[]` hook in `src/hooks/queries.ts` that
    encapsulates this branching. Both components simplify to a single call.

- [ ] **`useDebounce` should live in `src/hooks/useDebounce.ts`, not inlined in `Index.tsx`**
  - `useDebounce` is a generic utility currently defined inside `Index.tsx`. It will be needed
    anywhere search is added (Timeline filters, etc.). Move to its own file.

- [ ] **`Review.tsx` keyboard nav uses unpaginated `useDocuments()`**
  - Arrow key navigation works by finding the current doc in `docsData.items`. Since `useDocuments`
    now hits a paginated endpoint, only the first page of docs is available for navigation. For a
    real corpus of 1 000+ documents this silently truncates the navigable set. Note for now;
    proper fix would fetch a flat id-list from the API or do cursor navigation.

- [ ] **`DocumentPreview.tsx`: hardcoded external PDF mock URL**
  - Line 38 loads a raw.githubusercontent.com PDF as a stand-in for real content. When the backend
    exposes a document content/render endpoint, wire it here. Until then, keep as-is but add a
    `// TODO` comment so it's easy to find.

---

### 🔵 Notes / non-blocking observations

- **`queryClient` is module-level in `App.tsx`** — fine for a SPA, but shared across mounts. Will
  cause test pollution if integration tests ever render `App` in isolation. Low priority.

- **`useStore` shape is appropriate** — `selectedDocId` correctly belongs in global state since it
  crosses five components (BundleTree, DocumentList, DocumentPreview, MetadataPanel, Timeline).
  `activeTab` as a string key is fine for the current flat routing model.

- **Tab hiding when `activeTab === 'cases'`** — hiding all non-cases tabs while on the Matter
  screen (lines 31–32 of `TopNav`) is arguably the right UX (force configuration before review),
  but is implemented by filtering inside the map rather than conditionally rendering the whole nav.
  Worth reviewing when matter is always pre-configured.

- **`SourceCard` used only in `NewCaseWizard`** — it's a small component but worth keeping in
  `src/components/cases/` as it is; would be a natural reuse point if an "Edit Sources" flow is
  added later.

---

## Refactor spec notes

- API base: `http://localhost:8000` (env: `VITE_API_URL`)
- Single-matter model: no multi-case list; Cases screen is "Matter Setup"
- `o365` source: disabled with "Coming soon" tooltip (API returns 400)
- `reviewer` identity: read from `localStorage` key `"reviewer"`, default `"reviewer"`
- `submitReview` body now requires `reviewer` field
- `searchDocuments` returns `SearchResultResponse[]` (not `{items, total}`)
- `stats.by_category` shape: `{category_id, category_name, box_code, total, reviewed}[]`
- TanStack Query v5: `refetchInterval` receives `Query` object — use `query.state.data?.status`
- Bundle screen: bundles ARE boxes; no saved named bundles
- `moveCategory`: body is `{category_id: string | null}` (null = staging)
