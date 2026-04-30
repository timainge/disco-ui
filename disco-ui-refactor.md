# disco-ui — API Integration Refactor Log

Changes required to connect disco-ui to the real FastAPI backend.
Organised by file. Each entry states what changes, driven by which API shape.

**API spec:** `discovery/.dev/api-spec.md`
**Base URL:** `http://localhost:8000` (configurable via env `VITE_API_URL`)
**Interactive docs:** `http://localhost:8000/docs`

---

## `src/lib/config.ts` — Add base URL config (new file)

```typescript
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
```

Update `.env.example`:
```
VITE_API_URL=http://localhost:8000
```

---

## `src/lib/api.ts` — Replace mocks with real fetch

This is the primary integration file. Replace the entire mock implementation with real `fetch` calls.

### Add `apiFetch` wrapper

```typescript
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}
```

Use `apiFetch` for all api methods. It extracts FastAPI's `{detail: ...}` error body.

### Type interface updates

| Interface | Current | Required change |
|-----------|---------|-----------------|
| `Document` | `is_reviewed: boolean` | Remove — derive from `review !== null` in `DocumentDetail`. List endpoint doesn't return review. |
| `Document` | Missing `addressee`, `addressee_org` | Add both fields (`string \| null`) |
| `Classification` | Missing `page_start`, `page_end`, `duplicate_of`, `is_stale` | Add these fields |
| `Category` | Missing `color` | Add `color?: string` |
| `Stats` | Missing `review_progress_pct`, `stale`, `last_classified_at`, `by_category` | Extend interface — all now returned by `GET /api/stats` |
| — | — | Add `Matter`, `IngestJob`, `VelocityEntry`, `TimelineEntry`, `Facets` interfaces |

### New `Matter` interface

```typescript
export interface Matter {
  matter_name: string;
  matter_reference: string | null;
  background_context: string | null;
  criteria: {
    keywords: string[];
    parties: string[];
    date_range: { from_date?: string; to_date?: string } | null;
    categories: string[];
  };
}
```

### New `IngestJob` interface

```typescript
export interface IngestJob {
  job_id: string;
  status: 'running' | 'complete' | 'failed';
  progress: { source: string; processed: number; total: number | null } | null;
  results: Array<{ source: string; documents_ingested: number; documents_updated: number; documents_skipped: number; errors: string[] }> | null;
  error: string | null;
}
```

**Note on `results` field names:** The API returns `IngestResult` field names — `documents_ingested`, `documents_updated`, `documents_skipped` (not `ingested`, `updated`, `skipped`).

### Source name mapping — handled server-side

The API's `POST /api/ingest` accepts UI-friendly source names directly:

| UI sends | API receives | Notes |
|----------|-------------|-------|
| `"google"` | remapped to `"gmail"` | handled in `api/ingest.py` |
| `"local"` | remapped to `"filesystem"` | handled in `api/ingest.py` |
| `"o365"` | returns HTTP 400 | not supported |

**The UI does not need its own SOURCE_MAP.** Just send the UI value directly. Show a disabled state with "Coming soon" tooltip for `o365` before submitting.

### `api` object — method changes

| Current method | Change |
|---------------|--------|
| `getStats()` | `GET /api/stats` — return type now includes `review_progress_pct`, `stale`, `last_classified_at`, `by_category` |
| `getBoxes()` | `GET /api/boxes` — unchanged shape |
| `getCategories(boxId?)` | Use `GET /api/categories?box_id={boxId}` — flat endpoint now available. No multi-call helper needed. |
| `getDocuments(filters)` | `GET /api/documents?{filters}` — params: `category_id`, `box_id`, `staging`, `is_relevant`, `is_duplicate`, `is_privileged`, `source`, `content_type`, `from_date`, `to_date`, `has_review`, `limit`, `offset` |
| `getDocumentDetail(id)` | `GET /api/documents/{id}` |
| `submitReview(id, decision)` | `POST /api/documents/{id}/review` — body requires `reviewer: string`. Add `getReviewer()` that reads from `localStorage` (set once, default `"reviewer"`). |
| `addNote(id, note)` | `POST /api/documents/{id}/notes` — body: `{content, author}` |
| `addTag(id, tag)` | `POST /api/documents/{id}/tags` — body: `{tag, tagged_by}` |
| `removeTag(id, tag)` | `DELETE /api/documents/{id}/tags/{tag}` |
| `searchDocuments(query)` | `GET /api/search?q={query}&mode=fts` — returns `SearchResultResponse[]` not `{items, total}`. Each item has `.document`, `.bm25_rank`, `.vector_rank`, `.rrf_score`. |
| `moveCategory(id, categoryId)` | `POST /api/documents/{id}/move` — body: `{category_id: string \| null}` (null for staging) |
| **Add** `getMatter()` | `GET /api/matter` |
| **Add** `updateMatter(patch)` | `PATCH /api/matter` |
| **Add** `startIngest(params)` | `POST /api/ingest` — body: `{source?, from_date?, to_date?, limit?}` |
| **Add** `getIngestJob(jobId)` | `GET /api/ingest/{jobId}` |
| **Add** `getVelocity(days?)` | `GET /api/stats/velocity?days={days}` |
| **Add** `getTimeline(filters?)` | `GET /api/timeline` — query: `from_date`, `to_date`, `category_id`, `box_id`, `limit` |
| **Add** `startBundleExport(params)` | `POST /api/bundle/export` — body: `{output_dir?, working_copy?}` |
| **Add** `getBundleJob(jobId)` | `GET /api/bundle/export/{jobId}` |
| **Add** `validateBundle()` | `POST /api/bundle/validate` |
| **Add** `getSearchFacets(q?)` | `GET /api/search/facets?q={q}` |

---

## `src/hooks/queries.ts` — New and updated hooks

### Updated hooks

| Hook | Change |
|------|--------|
| `useStats` | Return type gains `review_progress_pct`, `stale`, `last_classified_at`, `by_category`. Update callers. |
| `useCategories` | Change to call `GET /api/categories` (flat endpoint — no multi-call helper needed) |
| `useDocuments` | Update `filters` type to match real API params (add `staging`, `has_review`) |
| `useSearchDocuments` | Response is `SearchResultResponse[]` not `{items, total}`. Adapt. |

### New hooks to add

```typescript
// Matter
export const useMatter = () => useQuery({ queryKey: ['matter'], queryFn: api.getMatter });
export const useUpdateMatter = () => useMutation({
  mutationFn: api.updateMatter,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matter'] }),
});

// Ingest job polling
export const useStartIngest = () => useMutation({ mutationFn: api.startIngest });
export const useIngestJob = (jobId: string | null) => useQuery({
  queryKey: ['ingest-job', jobId],
  queryFn: () => api.getIngestJob(jobId!),
  enabled: !!jobId,
  refetchInterval: (query) => query.state.data?.status === 'running' ? 1000 : false,
});

// Stats velocity
export const useVelocity = (days = 30) => useQuery({
  queryKey: ['velocity', days],
  queryFn: () => api.getVelocity(days),
});

// Timeline
export const useTimeline = (filters: TimelineFilters = {}) => useQuery({
  queryKey: ['timeline', filters],
  queryFn: () => api.getTimeline(filters),
});

// Bundle export job polling
export const useStartBundleExport = () => useMutation({ mutationFn: api.startBundleExport });
export const useBundleJob = (jobId: string | null) => useQuery({
  queryKey: ['bundle-job', jobId],
  queryFn: () => api.getBundleJob(jobId!),
  enabled: !!jobId,
  refetchInterval: (query) => query.state.data?.status === 'running' ? 2000 : false,
});
```

**TanStack Query v5 note:** `refetchInterval` receives a `Query` object, not the data directly. Use `query.state.data?.status`.

---

## `src/screens/Cases.tsx` — Single-matter model

The Cases screen currently shows a mock list of multiple cases. In the single-matter model it becomes a "Matter Setup" entry point.

### Changes

1. **Remove `mockCases` list.** Replace with `useMatter()` — show the single current matter's name, document count (from `stats.total_documents`), and status (Active / Processing based on ingest job state).

2. **"New Case" → "Configure Matter".** The wizard remains but now:
   - Step 1 (`caseName`, `caseBackground`) → calls `PATCH /api/matter` with `matter_name` and `background_context`
   - Step 2 (sources) → `google` and `local` are supported; `o365` disabled with "Coming soon" tooltip. Send source values as-is — the API handles remapping.
   - Step 3 (date range, queries) → calls `POST /api/ingest` and transitions to the progress screen

3. **Replace mock `setTimeout` progress** with real polling via `useIngestJob`:
   ```typescript
   const [jobId, setJobId] = useState<string | null>(null);
   const { data: job } = useIngestJob(jobId);

   const startIngest = async () => {
     const { job_id } = await api.startIngest({ source, from_date, to_date });
     setJobId(job_id);
   };

   useEffect(() => {
     if (job?.status === 'complete') onComplete();
     if (job?.status === 'failed') setError(job.error);
   }, [job?.status]);
   ```

4. **Progress display** — map `job.progress.source` and `job.progress.processed` to the status string. Show per-source results (`documents_ingested`, `documents_updated`, `documents_skipped`) in the summary box when `status === 'complete'`.

---

## `src/screens/Dashboard.tsx` — Remove client-side aggregation

### Changes

1. **Category progress breakdown** — currently computed client-side. Replace with `stats.by_category` which already includes both `total` and `reviewed` per category:
   ```typescript
   // Before (client-side, fragile)
   const catDocs = documents.filter(d => d.classification?.category_id === cat.id);

   // After (from stats.by_category — total AND reviewed already included)
   const catStat = stats.by_category?.find(s => s.category_id === cat.id);
   const { total = 0, reviewed = 0 } = catStat ?? {};
   ```
   `by_category` shape: `{category_id, category_name, box_code, total, reviewed}` — no extra query needed.

2. **Stale docs count** — `stats.stale` is now included in `GET /api/stats`. Replace any client-side `documents.filter(d => d.classification?.is_stale)` with `stats.stale` directly.

3. **"Last classified" timestamp** — `stats.last_classified_at` is now included in `GET /api/stats`. No separate query needed.

---

## `src/screens/Index.tsx` — Server-side pagination and search

### Changes

1. **Client-side → server-side pagination.** Replace `getPaginationRowModel()` + `getFilteredRowModel()` with server-driven state:
   - Pass `limit` and `offset` to `useDocuments()`. Drive `pageIndex`/`pageSize` from URL params or Zustand.
   - `total` from `GET /api/documents` response (`{items, total}`) drives `pageCount`.

2. **Global search bar** — `globalFilter` currently filters client-side. Replace with debounced call to `GET /api/search` when query is non-empty; fall back to `GET /api/documents` when empty:
   ```typescript
   const debouncedQuery = useDebounce(globalFilter, 300);
   const { data } = debouncedQuery
     ? useSearchDocuments(debouncedQuery)
     : useDocuments(filters);
   ```

3. **Filter dropdowns** — "Document Type" dropdown currently uses a derived list from loaded documents. Replace with `GET /api/search/facets` response `content_type` keys.

4. **Column: `addressee`** — add an `addressee` column (currently absent). Maps from `document.addressee`.

---

## `src/screens/Review.tsx` — Minor updates

1. **`is_reviewed` flag** — currently on `Document` interface. Remove. Derive from `doc.review !== null` (only in `DocumentDetail`). For the list view, use the `has_review` filter parameter on `GET /api/documents`.

2. **Privilege confirmation** — `PATCH /api/documents/{id}` with body `{privilege_flag, privilege_type}` for privilege updates.

---

## `src/screens/Bundle.tsx` — Wire to real export

1. Replace static bundle tree with `GET /api/boxes` + `GET /api/categories` + filtered `GET /api/documents?box_id={id}`.
2. **Export flow:**
   - Validate → `POST /api/bundle/validate` — show `{valid, warnings, errors}` with confirm dialog
   - Export → `POST /api/bundle/export` → poll `useBundleJob` until `status === 'complete'`
   - Show output path from `result.output_dir` on completion
3. **"Bundles are Boxes"** — remove any UI concept of saving a named bundle collection. The bundle screen IS the box/category tree. Sidebar lists boxes; selecting one shows categories and documents.

---

## `src/components/review/MetadataPanel.tsx` — New fields

Add display for:
- `addressee` / `addressee_org` (currently shows only `author`)
- `page_code` with box reference format `BOX.NN.NNN`
- `privilege_type` + `privilege_reason` (when `is_privileged === true`)
- `is_stale` warning badge (when `classification.is_stale === true`)
