# disco-ui refactor — progress tracker

Source spec: `disco-ui-refactor.md` (on `origin/main`)

---

## Completed — initial refactor

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

## Completed — quality review fixes

### 🔴 Bugs

- [x] **`Bundle.tsx`: Export button calls `handleValidate` instead of exporting** — restructured to branch on validation state: no validation → validate, warnings → confirm dialog, valid → export directly
- [x] **`Index.tsx`: Redundant `useDocuments` call when search is active** — added `enabled` option to `useDocuments`; passes `enabled: !debouncedQuery` to skip the call during search
- [x] **`useIngestJob`: polling stops on first network error** — fixed to `(!status || status === 'running') ? 1000 : false` so polling survives transient failures

### 🟠 Hardcoded / stale data

- [x] **`TopNav`: hardcoded matter name and review stats** — wired to `useMatter()` and `useStats()`
- [x] **`TopNav`: tab label says "Cases"** — changed to `label: 'Matter'`
- [x] **`DocumentPreview.tsx`: email "To:" uses stale `metadata?.to`** — fixed to `docDetail.addressee ?? docDetail.metadata?.to`
- [x] **`NewCaseWizard.tsx`: `queries` field collected but never sent** — removed misleading textarea from UI

### 🟡 Composition / architecture

- [x] **`AdvancedFilters.tsx` dead code** — deleted old TanStack-Table-based component; `ServerAdvancedFilters` moved into `src/components/index/AdvancedFilters.tsx` with clean typed props interface
- [x] **`Timeline.tsx` using `useDocuments`** — switched to `useTimeline` / `TimelineEntry`; all JSX updated to top-level `page_code`, `source`, `category_name` fields
- [x] **`isDarkMode` in `App.tsx` local state** — moved to Zustand store with `zustand/middleware/persist`; prop-drilling through `App → TopNav` removed
- [x] **Duplicate search logic in `BundleTree` + `DocumentList`** — extracted `useDocumentSearch(query)` hook in `src/hooks/queries.ts`
- [x] **`useDebounce` inlined in `Index.tsx`** — moved to `src/hooks/useDebounce.ts`

---

## Open — blocked on backend

### 🟡 Issue 001 — Review keyboard nav truncates to first page
> Tracked in `.dev/issues/001-review-keyboard-nav-pagination.md`

Arrow-key navigation in `DocumentList.tsx` only navigates within the current page. Needs `GET /api/documents/ids` to pre-fetch an ordered id list for the full corpus. See `.dev/backend-changes.md`.

### 🟡 Issue 002 — DocumentPreview shows hardcoded mock PDF
> Tracked in `.dev/issues/002-document-preview-content-endpoint.md`

`DocumentPreview.tsx` iframe is hardcoded to a GitHub PDF stub. Needs `GET /api/documents/{id}/content` streaming endpoint (with DOCX→PDF conversion and EML→HTML rendering). See `.dev/backend-changes.md`.

---

## Notes / non-blocking observations

- **`queryClient` is module-level in `App.tsx`** — fine for a SPA; will cause test pollution if `App` is ever rendered in isolation in integration tests.
- **`useStore` shape is appropriate** — `selectedDocId` crosses five components; global state is the right call.
- **Tab hiding when `activeTab === 'cases'`** — UX is reasonable (force setup before review) but implemented by filtering inside the map; revisit if matter is always pre-configured on load.
- **`SourceCard` used only in `NewCaseWizard`** — keep in `src/components/cases/`; natural reuse point for an "Edit Sources" flow.

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
