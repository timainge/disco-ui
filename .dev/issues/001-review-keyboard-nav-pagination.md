---
id: 001
title: "Review screen keyboard navigation truncates to first page"
status: open
priority: medium
area: frontend
blocked_by: backend
labels: [ux, keyboard-nav, pagination]
files:
  - src/components/review/DocumentList.tsx
  - src/hooks/queries.ts
---

## Problem

Arrow-key navigation in the Review screen (`DocumentList.tsx`) works by scanning `table.getRowModel().rows` for the current `selectedDocId` and advancing to the adjacent row. Since `useDocuments` now hits a paginated endpoint (default page size 15–50), only the currently loaded page is available for navigation.

For a matter with 1 000+ documents a user pressing ↓ at the bottom of page 1 wraps back to row 0 on page 1 rather than advancing to the first document on page 2. This silently truncates the navigable set with no indication to the user.

## Desired behaviour

Arrow-key navigation should advance through the **entire document corpus** sequentially, not just the visible page.

## Options

### Option A — Backend id-list endpoint (preferred)
Add `GET /api/documents/ids` returning an ordered flat list of document ids (respecting the same filter/sort params as `GET /api/documents`). The frontend fetches this once on mount and uses it as the navigation index; individual document data is loaded on demand via `GET /api/documents/{id}`.

### Option B — Cursor navigation endpoint
Add `GET /api/documents/{id}/next` and `GET /api/documents/{id}/prev` that return the adjacent document id given the current sort/filter context. Simpler backend surface but requires a round-trip per keypress.

### Option C — Client-side workaround (no backend change)
Increase the page size to a very large value (e.g. 2 000) so the full corpus fits in one query. Acceptable for small matters; not viable at scale.

## Backend requirement

See `backend-changes.md` — Option A is the preferred path.

## Acceptance criteria

- Pressing ↓ on the last visible document advances to the first document of the next logical page.
- Pressing ↑ on the first visible document retreats to the last document of the previous logical page.
- Navigation respects the current search/filter state.
- Performance: navigation keypress latency < 100 ms (id-list pre-fetched, not fetched on keypress).
