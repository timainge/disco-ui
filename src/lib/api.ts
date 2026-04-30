import { API_BASE } from './config';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

function getReviewer(): string {
  return localStorage.getItem('reviewer') ?? 'reviewer';
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Box { id: string; code: string; label: string; sort_order: number; }

export interface Category {
  id: string; box_id: string; number: number; name: string;
  description?: string; color?: string;
}

export interface Classification {
  document_id: string; category_id: string | null; page_code: string | null;
  page_start: number | null; page_end: number | null;
  relevance_score: number | null; is_relevant: boolean | null; relevance_explanation: string | null;
  is_duplicate: boolean; duplicate_of: string | null;
  is_privileged: boolean; privilege_type: string | null; privilege_reason: string | null;
  category_confidence: number | null; classified_by: string; is_stale: boolean;
}

export interface Document {
  id: string; source: string; title: string; content_type: string; document_date: string | null;
  date_is_estimated: boolean; doc_type: string | null; author: string | null;
  addressee: string | null; addressee_org: string | null;
  classification: Classification | null;
}

export interface Review { id: string; decision: string; reviewer: string; created_at: string; }

export interface DocumentDetail extends Document {
  source_id: string; original_path: string | null; ingested_at: string; metadata: any;
  review: Review | null; notes: any[]; tags: string[]; content?: string;
}

export interface CategoryStat {
  category_id: string; category_name: string; box_code: string; total: number; reviewed: number;
}

export interface Stats {
  total_documents: number; classified: number; relevant: number; privileged: number;
  duplicates: number; reviewed: number;
  review_progress_pct: number; stale: number; last_classified_at: string | null;
  by_category: CategoryStat[];
}

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

export interface IngestJob {
  job_id: string;
  status: 'running' | 'complete' | 'failed';
  progress: { source: string; processed: number; total: number | null } | null;
  results: Array<{
    source: string;
    documents_ingested: number;
    documents_updated: number;
    documents_skipped: number;
    errors: string[];
  }> | null;
  error: string | null;
}

export interface VelocityEntry { date: string; count: number; }

export interface TimelineEntry {
  id: string; document_date: string; title: string; source: string;
  author: string | null; category_name: string | null; page_code: string | null;
}

export interface Facets {
  content_type: Record<string, number>;
  source: Record<string, number>;
  category: Record<string, number>;
}

export interface SearchResultResponse {
  document: Document;
  bm25_rank: number | null;
  vector_rank: number | null;
  rrf_score: number | null;
}

export interface BundleValidation { valid: boolean; warnings: string[]; errors: string[]; }

export interface BundleJob {
  job_id: string;
  status: 'running' | 'complete' | 'failed';
  result?: { output_dir: string };
  error: string | null;
}

export interface DocumentsResponse { items: Document[]; total: number; }

export interface DocumentFilters {
  category_id?: string;
  box_id?: string;
  staging?: boolean;
  is_relevant?: boolean;
  is_duplicate?: boolean;
  is_privileged?: boolean;
  source?: string;
  content_type?: string;
  from_date?: string;
  to_date?: string;
  has_review?: boolean;
  limit?: number;
  offset?: number;
}

export interface TimelineFilters {
  from_date?: string;
  to_date?: string;
  category_id?: string;
  box_id?: string;
  limit?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  getStats: () =>
    apiFetch<Stats>('/api/stats'),

  getBoxes: () =>
    apiFetch<Box[]>('/api/boxes'),

  getCategories: (boxId?: string) => {
    const qs = boxId ? `?box_id=${encodeURIComponent(boxId)}` : '';
    return apiFetch<Category[]>(`/api/categories${qs}`);
  },

  getDocuments: (filters: DocumentFilters = {}) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined) params.set(k, String(v));
    }
    const qs = params.toString() ? `?${params}` : '';
    return apiFetch<DocumentsResponse>(`/api/documents${qs}`);
  },

  getDocumentDetail: (id: string) =>
    apiFetch<DocumentDetail>(`/api/documents/${encodeURIComponent(id)}`),

  submitReview: (id: string, decision: string) =>
    apiFetch<Review>(`/api/documents/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reviewer: getReviewer() }),
    }),

  addNote: (id: string, note: string) =>
    apiFetch<any>(`/api/documents/${encodeURIComponent(id)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: note, author: getReviewer() }),
    }),

  addTag: (id: string, tag: string) =>
    apiFetch<string>(`/api/documents/${encodeURIComponent(id)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, tagged_by: getReviewer() }),
    }),

  removeTag: (id: string, tag: string) =>
    apiFetch<string>(`/api/documents/${encodeURIComponent(id)}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    }),

  searchDocuments: (query: string) => {
    const params = new URLSearchParams({ q: query, mode: 'fts' });
    return apiFetch<SearchResultResponse[]>(`/api/search?${params}`);
  },

  moveCategory: (id: string, categoryId: string | null) =>
    apiFetch<any>(`/api/documents/${encodeURIComponent(id)}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: categoryId }),
    }),

  getMatter: () =>
    apiFetch<Matter>('/api/matter'),

  updateMatter: (patch: Partial<Matter>) =>
    apiFetch<Matter>('/api/matter', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),

  startIngest: (params: { source?: string; from_date?: string; to_date?: string; limit?: number }) =>
    apiFetch<{ job_id: string }>('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),

  getIngestJob: (jobId: string) =>
    apiFetch<IngestJob>(`/api/ingest/${encodeURIComponent(jobId)}`),

  getVelocity: (days = 30) =>
    apiFetch<VelocityEntry[]>(`/api/stats/velocity?days=${days}`),

  getTimeline: (filters: TimelineFilters = {}) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined) params.set(k, String(v));
    }
    const qs = params.toString() ? `?${params}` : '';
    return apiFetch<TimelineEntry[]>(`/api/timeline${qs}`);
  },

  validateBundle: () =>
    apiFetch<BundleValidation>('/api/bundle/validate', { method: 'POST' }),

  startBundleExport: (params: { output_dir?: string; working_copy?: boolean } = {}) =>
    apiFetch<{ job_id: string }>('/api/bundle/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),

  getBundleJob: (jobId: string) =>
    apiFetch<BundleJob>(`/api/bundle/export/${encodeURIComponent(jobId)}`),

  getSearchFacets: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return apiFetch<Facets>(`/api/search/facets${qs}`);
  },
};
