---
updated: 2026-05-01
related_issues: [001, 002]
---

# Backend changes required — disco-ui outstanding issues

This document summarises the API additions needed to unblock the two open frontend issues. Both are currently worked around in the UI (keyboard nav wraps on page boundary; document preview shows a mock PDF). Neither can be properly fixed without backend support.

---

## 1. Document id-list endpoint (Issue 001 — keyboard navigation)

### Proposed endpoint

```
GET /api/documents/ids
```

### Query parameters

Accepts the same filter/sort parameters as `GET /api/documents`:

| Param | Type | Description |
|---|---|---|
| `content_type` | string | Filter by doc type |
| `category_id` | string (UUID) | Filter by category |
| `from_date` | date | Document date range start |
| `to_date` | date | Document date range end |
| `is_relevant` | bool | Filter relevant docs |
| `is_privileged` | bool | Filter privileged docs |
| `has_review` | bool | Filter reviewed/unreviewed |
| `sort` | string | Sort field (default: `document_date`) |
| `order` | `asc`\|`desc` | Sort direction (default: `asc`) |

### Response

```json
{
  "ids": ["uuid1", "uuid2", "uuid3", "..."],
  "total": 1247
}
```

### Notes

- No pagination — returns the full ordered id list for the active filter context.
- For large matters (5 000+ docs) this is a few hundred KB of UUIDs; acceptable for a one-time fetch on filter change.
- The frontend pre-fetches this list and uses it as a navigation index. Individual document data is already fetched by `GET /api/documents/{id}` when selected.
- Consider caching: the list is cheap to regenerate but can be memoised per filter fingerprint if needed.

---

## 2. Document content endpoint (Issue 002 — document preview)

### Proposed endpoint

```
GET /api/documents/{id}/content
```

### Behaviour

Returns the source file for the document. Recommended implementation:

1. Look up the document's storage path from the database.
2. Stream the file from storage (filesystem, S3, etc.) with the correct `Content-Type`.
3. Set `Content-Disposition: inline` so the browser renders (not downloads) PDFs.

### Response

| Scenario | Status | Content-Type |
|---|---|---|
| PDF source | 200 | `application/pdf` |
| DOCX (converted to PDF) | 200 | `application/pdf` |
| Plain text | 200 | `text/plain; charset=utf-8` |
| EML (email source) | 200 | `text/html; charset=utf-8` (rendered body) |
| Not found | 404 | `application/json` |

### DOCX handling

If the source file is `.docx`, convert to PDF server-side before streaming (e.g. via LibreOffice headless or a dedicated conversion service). Return the PDF so the browser renders it natively. Cache the converted output to avoid repeated conversion.

### Authentication

The endpoint must respect the same auth as all other API routes. If the UI renders the content in an `<iframe src="/api/documents/{id}/content">`, the browser will send cookies/session headers automatically. If using a presigned URL (S3), return it from a separate endpoint:

```
GET /api/documents/{id}/content-url
→ { "url": "https://...", "expires_at": "2026-05-01T12:05:00Z" }
```

### EML rendering

For email documents, return an HTML representation rather than the raw `.eml` source:

```html
<html>
<head>...</head>
<body>
  <dl class="headers">
    <dt>From</dt><dd>sender@example.com</dd>
    <dt>To</dt><dd>recipient@example.com</dd>
    <dt>Date</dt><dd>2024-03-15</dd>
    <dt>Subject</dt><dd>Re: Contract amendment</dd>
  </dl>
  <hr />
  <!-- email body (sanitised HTML or text/plain wrapped in <pre>) -->
</body>
</html>
```

This avoids CSP issues with raw `multipart/` content in iframes.

---

## Priority

| Issue | Endpoint | Effort | Priority |
|---|---|---|---|
| 002 — Document preview | `GET /api/documents/{id}/content` | Medium | High — preview is non-functional |
| 001 — Keyboard nav | `GET /api/documents/ids` | Low | Medium — nav works but silently truncates |
