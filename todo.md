# disco-ui refactor — progress tracker

Source spec: `disco-ui-refactor.md` (on `origin/main`)

## Tasks

- [x] Create `src/lib/config.ts` and update `.env.example`
- [x] Rewrite `src/lib/api.ts` — apiFetch wrapper, updated interfaces, real endpoints
- [x] Update `src/hooks/queries.ts` — update existing hooks, add new hooks
- [x] Update `src/screens/Dashboard.tsx` — use `stats.by_category`, `stats.stale`, `stats.last_classified_at`
- [x] Update `src/screens/Cases.tsx` — single-matter model with `useMatter`
- [x] Update `src/components/cases/NewCaseWizard.tsx` — PATCH matter, real ingest polling
- [x] Update `src/screens/Index.tsx` — server-side pagination, API search, facets, `addressee` column
- [x] Rewrite `src/screens/Bundle.tsx` — real box/category tree, validate + export flow
- [x] Update `src/components/review/MetadataPanel.tsx` — `addressee`, `privilege_type`, `is_stale` badge
- [x] Update `src/components/review/BundleTree.tsx` — handle new `SearchResultResponse[]` shape
- [x] Fix `src/components/review/DocumentList.tsx` — update search result mapping
- [x] Add `src/vite-env.d.ts` — Vite client types for `import.meta.env`
- [x] Commit and push all changes

## Notes

- API base: `http://localhost:8000` (env: `VITE_API_URL`)
- Single-matter model: no multi-case list; Cases screen becomes "Matter Setup"
- `o365` source: disabled with "Coming soon" tooltip (API returns 400)
- `reviewer` identity: read from `localStorage` key `"reviewer"`, default `"reviewer"`
- `submitReview` body now requires `reviewer` field
- `searchDocuments` now returns `SearchResultResponse[]` (not `{items, total}`)
- `stats.by_category` shape: `{category_id, category_name, box_code, total, reviewed}[]`
- TanStack Query v5: `refetchInterval` receives `Query` object — use `query.state.data?.status`
- Bundle screen: bundles ARE boxes; no saved named bundles
- `moveCategory`: body is `{category_id: string | null}` (null = staging)
