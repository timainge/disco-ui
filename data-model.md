# Application State & Data Model

This document captures the entirety of the application state for the Discovery/Review platform. It categorizes the state into three main areas: **Application Layer State** (persisted and synced with a backend/service), **Derived State** (computed on the fly), and **UX-Specific State** (ephemeral UI state).

---

## 1. Application Layer State (Core Data)
This is the source of truth. This data must be persisted in a database, indexed for search, and synced via a Web API or local background service.

### 1.1 Cases / Matters
Represents a legal matter or investigation.
*   `id` (string): Unique identifier.
*   `name` (string): Name of the case (e.g., "Smith v Jones — 2024/042").
*   `background_context` (string): Instructions/context provided to the LLM for relevance scoring.
*   `status` (enum): `Active`, `Processing`, `Closed`.
*   `created_at` (timestamp): Date the case was created.
*   `document_count` (number): Total number of ingested documents.

### 1.2 Ingestion Jobs
Tracks the state of data extraction from external sources (Google, O365, Local).
*   `id` (string): Unique identifier.
*   `case_id` (string): Foreign key to the Case.
*   `sources` (object): `{ google: boolean, o365: boolean, local: boolean }`.
*   `content_types` (object): `{ email: boolean, calendar: boolean, files: boolean }`.
*   `date_range` (object): `{ start: date, end: date }`.
*   `queries` (string): Optional pre-filtering keywords/queries.
*   `status` (enum): `Pending`, `Fetching`, `Analyzing`, `Indexing`, `Complete`, `Failed`.
*   `progress` (number): 0-100 percentage.

### 1.3 Documents / Artifacts
The core entities being reviewed.
*   `id` (string): Unique identifier.
*   `case_id` (string): Foreign key to the Case.
*   `source` (string): Origin of the document (e.g., 'gmail', 'filesystem', 'o365').
*   `title` (string): Document title or email subject.
*   `content_type` (string): File extension or MIME type (e.g., 'eml', 'pdf', 'docx').
*   `document_date` (timestamp | null): Primary date of the document.
*   `author` (string | null): Sender or creator.
*   `recipient` (string | null): To/CC list.
*   `content` (string): Extracted text content for rendering and full-text search.

### 1.4 Document Classifications (Review State)
The metadata applied to a document by a human reviewer or the LLM.
*   `document_id` (string): Foreign key to Document.
*   `is_relevant` (boolean): Relevance flag.
*   `is_privileged` (boolean): Privilege flag.
*   `category_id` (string | null): Foreign key to Category (Issue code).
*   `page_code` (string | null): Bates stamp or physical page reference.
*   `tags` (string[]): Array of custom string tags.
*   `notes` (string): Reviewer comments.

### 1.5 Categories (Issue Codes)
Taxonomy for organizing documents.
*   `id` (string): Unique identifier.
*   `case_id` (string): Foreign key to the Case.
*   `name` (string): Category name (e.g., "Financial Records").
*   `description` (string): Detailed description.
*   `color` (string): Hex code for UI rendering.

### 1.6 Bundles / Export Sets
Collections of documents prepared for export/production.
*   `id` (string): Unique identifier.
*   `case_id` (string): Foreign key to the Case.
*   `name` (string): Bundle name.
*   `document_ids` (string[]): Array of included document IDs.
*   `created_at` (timestamp): Creation date.
*   `status` (enum): `Draft`, `Generating`, `Ready`.

---

## 2. Derived State
This state is not stored directly in the database but is computed dynamically on the client or via specialized backend aggregation queries.

*   **Dashboard Statistics**:
    *   `totalDocuments`, `reviewedCount`, `relevantCount`, `privilegedCount`.
    *   `reviewProgressPercentage` (reviewedCount / totalDocuments * 100).
*   **Chart Aggregations**:
    *   Documents by Category (Count of docs grouped by `category_id`).
    *   Review Velocity (Count of classifications grouped by day/week).
*   **Timeline Events**:
    *   Chronological array of documents mapped to a specific timeline data structure (calculating gaps between dates, sorting by `document_date`).
*   **Available Document Types**:
    *   A unique, sorted list of all `content_type` values present in the current document set (used for the Advanced Filters dropdown).

---

## 3. UX-Specific State (Ephemeral)
This state lives entirely in the browser's memory (React state, Zustand, URL parameters). It controls the user interface.

### 3.1 Global UI State
*   `activeTab` (string): Current screen ('cases', 'dashboard', 'review', 'index', etc.).
*   `isDarkMode` (boolean): Theme preference. *(Could optionally be synced to a User Profile API).*
*   `selectedDocId` (string | null): The document currently being viewed in the Review or Timeline screens.

### 3.2 Data Table & Search State (Index Screen)
*   `sorting` (array): Current column sort configuration.
*   `columnFilters` (array): Active filters on specific columns.
*   `globalFilter` (string): Text in the global search bar.
*   `showFilters` (boolean): Toggle state of the Advanced Filters panel.
*   `pagination` (object): Current page index and page size.
*   *Note: If "Saved Searches" are implemented, this UX state would be serialized and moved to the Application Layer.*

### 3.3 Wizard & Form Draft State (Cases Screen)
*   `isCreating` (boolean): Whether the New Case wizard is open.
*   `step` (number): Current step in the wizard (1, 2, or 3).
*   `caseName`, `caseBackground`, `sources`, `contentTypes`, `dateRange`, `queries`: Draft values held in memory before hitting "Start Ingestion".

### 3.4 View Preferences
*   `isListView` (boolean): Toggle between flat list and folder tree in the Review screen sidebar.
*   `zoomLevel` (number): Current zoom scale of the Timeline view.
*   `selectedBundleId` (string): The bundle currently selected in the Bundle screen sidebar.

---

## 4. Synchronization & Architecture Considerations

If connecting this frontend to an "Application Layer" (Web API or Local Service), consider the following architectural patterns:

1.  **Full-Text Search & Indexing**:
    *   The `globalFilter` and `queries` states require a robust search engine (e.g., Elasticsearch, Typesense, or SQLite FTS) on the backend. The frontend should debounce the `globalFilter` state and send it as a query parameter to a `/api/documents/search` endpoint.
2.  **Real-time Ingestion Updates**:
    *   The `ingestProgress` and `ingestStatus` UX states should be driven by WebSockets or Server-Sent Events (SSE) from the backend, rather than local `setTimeout` mocks.
3.  **Optimistic UI Updates**:
    *   When a user updates a document's classification (e.g., marking it "Relevant"), the UX should update immediately while a background mutation (via React Query) syncs the `is_relevant` flag to the backend.
4.  **Pagination & Large Datasets**:
    *   Currently, the `Index` screen uses client-side pagination (`getPaginationRowModel`). For a real discovery app with millions of documents, this UX state (`pageIndex`, `pageSize`) must be synced to the backend via API query parameters (Server-side pagination).
5.  **Local-First Architecture (Optional)**:
    *   If this is a desktop app (e.g., Electron/Tauri), the "Application Layer" could be a local SQLite database. In this case, the UX state interacts directly with IPC (Inter-Process Communication) commands to query and mutate the local database, blurring the line between API and local state.
