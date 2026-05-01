---
id: 002
title: "DocumentPreview uses hardcoded mock PDF URL instead of real content endpoint"
status: open
priority: high
area: frontend
blocked_by: backend
labels: [document-preview, pdf, content]
files:
  - src/components/review/DocumentPreview.tsx
---

## Problem

`DocumentPreview.tsx` renders document content inside an `<iframe>`. The `src` is currently hardcoded to a raw GitHub PDF URL as a stand-in:

```tsx
// TODO: replace with real content endpoint when backend exposes one
<iframe src="https://raw.githubusercontent.com/..." />
```

This means every document shows the same static PDF regardless of which document is selected. The feature appears to work but is entirely non-functional with real data.

## Desired behaviour

The iframe (or a purpose-built viewer) loads the actual content for the selected document — rendered or raw — from the backend. The content type should inform the viewer: PDFs render in the native iframe PDF viewer; plain text and HTML documents render appropriately; email source (`.eml`) renders the body with headers.

## Options

### Option A — Serve raw file via presigned URL or proxy (preferred)
`GET /api/documents/{id}/content` returns a redirect or stream of the source file (PDF, DOCX, EML, etc.). The frontend sets `<iframe src="/api/documents/{id}/content" />`. The browser handles PDF rendering natively. For DOCX, the backend converts to PDF or HTML on the fly.

### Option B — Rendered HTML endpoint
`GET /api/documents/{id}/render` returns an HTML fragment (for emails: rendered body + headers; for PDFs: extracted text in styled HTML). The frontend renders inside a sandboxed iframe via `srcdoc`. Avoids CORS/auth issues with binary content; loses fidelity for scanned PDFs.

### Option C — Signed S3/storage URL
If documents are stored in object storage, return a short-lived presigned URL from `GET /api/documents/{id}/content-url`. Frontend uses that as the iframe src. Works well if storage is already S3-compatible.

## Backend requirement

See `backend-changes.md` for the proposed endpoint contract.

## Acceptance criteria

- Selecting a document in `DocumentList` / `BundleTree` renders its actual content in the preview panel.
- PDFs display in the native browser PDF viewer.
- Emails render with To/From/Subject headers visible (either via the existing metadata panel or inline in the preview).
- The endpoint is authenticated (same session/token as all other API calls).
- Content loads within 2 s for documents ≤ 10 MB.
