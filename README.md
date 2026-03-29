# Discovery UI

A high-performance, dense, and interactive React application for legal discovery document review, built to interface with a FastAPI backend.

## Architecture & Code Structure

The application follows a feature-based screen architecture, designed for rapid iteration and clear separation of concerns.

```text
/src
├── components/          # Reusable, stateless UI components
│   ├── layout/          # Global layout components (TopNav)
│   ├── review/          # Review screen specific components (BundleTree, DocumentList, etc.)
│   └── ui/              # Generic design system components (Card, ProgressBar)
├── hooks/               # Custom React hooks (React Query data fetching)
├── lib/                 # Utilities and core services
│   ├── api.ts           # API client and mock data layer (FastAPI adapter)
│   └── utils.ts         # Helper functions (Tailwind class merging)
├── screens/             # Top-level feature views (mapped to tabs)
│   ├── Dashboard.tsx    # Triage and statistics overview
│   ├── Review.tsx       # Primary 3-panel document review workspace
│   ├── Index.tsx        # Spreadsheet view of the discovery index
│   ├── Timeline.tsx     # Chronological document view
│   └── Bundle.tsx       # Pre-flight checklist and export
├── store/               # Zustand global state management
├── App.tsx              # Root component, routing, and theme state
├── index.css            # Global styles and Tailwind CSS variables
└── main.tsx             # React entry point
```

## Component Hierarchy & Layouts

### 1. Global Layout
The app uses a fixed full-screen layout (`h-screen overflow-hidden`) to prevent window-level scrolling. Scrolling is delegated to specific panels (like the bundle tree or document preview) to maintain a desktop-app feel.

### 2. The Review Screen (Primary Workspace)
The `Review.tsx` screen implements a dense, three-panel layout using `react-resizable-panels`:
*   **Left Panel (Navigation):** Can be toggled between a hierarchical `BundleTree` (Boxes → Categories → Documents) and a flat, sortable `DocumentList` using the 'T' key.
*   **Center Panel (Preview):** The document viewer. Currently integrates `react-pdf` to render PDF documents with zoom and pagination controls.
*   **Right Panel (Metadata & Coding):** Divided into read-only metadata, AI Analysis (relevance scores, privilege reasons), and the interactive Review Coding form, complete with interactive tag and note management.

## State Management

### Current Implementation
*   **Server State (`@tanstack/react-query`):** Handles caching, background refetching, and invalidation of documents, stats, categories, and search results. Custom hooks in `src/hooks/queries.ts` abstract the API calls.
*   **Client State (`zustand`):** Manages global UI state like `selectedDocumentId`, `activeTab`, and theme preferences across different screens, ensuring persistence during navigation.
*   **Optimistic Updates:** The review decision radio buttons and category moves implement optimistic UI updates to ensure a snappy, zero-latency feel for the reviewer.

## Styling & Theming

*   **Tailwind CSS:** Used exclusively for styling.
*   **Design Tokens:** We use CSS variables in `index.css` to define semantic colors (`--primary`, `--muted`, `--success`, `--warning`).
*   **Color Palette:** The app uses a "Stone" color palette for the light theme to give a professional, document-centric feel, and a "Zinc" palette for the dark theme.
*   **Dark Mode:** Implemented via a `.dark` class toggled on the `<html>` element, controlled by global state.

---

## Roadmap & Missing Features

The current implementation is a high-fidelity prototype using mocked data, with many advanced features already implemented. The following features require further implementation:

### 1. Real Backend Integration
*   **Replace Mock API:** The `src/lib/api.ts` file currently uses mock data and `setTimeout` to simulate network latency. This needs to be replaced with actual `fetch` or `axios` calls to the FastAPI backend.
*   **Bundle Export Polling:** The Bundle export button should trigger a background job and poll for completion status.

### 2. Workspace & Case Management (Out of Spec, but Recommended)
*   The current spec assumes a single matter per running instance (CLI driven). If hosted centrally, the UI will need a "Matter Switcher" dropdown in the TopNav and an API namespace for `matter_id`.

### 3. Advanced Search Enhancements
*   **Hybrid Search:** While global search is implemented, integrating specific UI controls for switching between Full-Text Search (FTS) and Vector/Hybrid search would enhance discoverability.
*   **Faceted Search:** Adding faceted filtering (e.g., filtering by date ranges, specific authors, or multiple categories simultaneously) to the Index and Review screens.
