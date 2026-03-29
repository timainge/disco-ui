// Mock API implementation based on FastAPI spec

export interface Box { id: string; code: string; label: string; sort_order: number; }
export interface Category { id: string; box_id: string; number: number; name: string; description?: string; }
export interface Classification {
  document_id: string; category_id: string | null; page_code: string | null;
  relevance_score: number | null; is_relevant: boolean | null; relevance_explanation: string | null;
  is_duplicate: boolean; is_privileged: boolean; privilege_type: string | null; privilege_reason: string | null;
  category_confidence: number | null; classified_by: string; is_stale: boolean;
}
export interface Document {
  id: string; source: string; title: string; content_type: string; document_date: string | null;
  date_is_estimated: boolean; doc_type: string | null; author: string | null;
  classification: Classification | null;
  is_reviewed: boolean;
}
export interface Review { id: string; decision: string; reviewer: string; created_at: string; }
export interface DocumentDetail extends Document {
  source_id: string; original_path: string | null; ingested_at: string; metadata: any;
  review: Review | null; notes: any[]; tags: string[]; content?: string;
}

const mockBoxes: Box[] = [
  { id: 'b1', code: 'TJB', label: 'Tim J. Bloggs', sort_order: 1 }
];

const mockCategories: Category[] = [
  { id: 'c1', box_id: 'b1', number: 1, name: 'Correspondence', description: 'Emails and letters' },
  { id: 'c2', box_id: 'b1', number: 2, name: 'Invoices', description: 'Financial documents' },
  { id: 'c3', box_id: 'b1', number: 3, name: 'Contracts', description: 'Agreements' },
];

const mockDocuments: Document[] = [
  {
    id: 'd1', source: 'gmail', title: 'Re: Invoice #123', content_type: 'eml', document_date: '2025-03-07',
    date_is_estimated: false, doc_type: 'email', author: 'james@acme.com',
    is_reviewed: true,
    classification: {
      document_id: 'd1', category_id: 'c1', page_code: 'TJB.01.001', relevance_score: 0.94,
      is_relevant: true, relevance_explanation: 'Contains payment terms and invoice references',
      is_duplicate: false, is_privileged: false, privilege_type: null, privilege_reason: null,
      category_confidence: 0.87, classified_by: 'ai', is_stale: false
    }
  },
  {
    id: 'd2', source: 'filesystem', title: 'Draft Contract v2', content_type: 'pdf', document_date: '2025-03-05',
    date_is_estimated: true, doc_type: 'contract', author: 'tim@firm.com',
    is_reviewed: false,
    classification: {
      document_id: 'd2', category_id: 'c3', page_code: 'TJB.03.001', relevance_score: 0.99,
      is_relevant: true, relevance_explanation: 'Core agreement document',
      is_duplicate: false, is_privileged: true, privilege_type: 'legal_advice', privilege_reason: 'Drafting advice',
      category_confidence: 0.95, classified_by: 'ai', is_stale: false
    }
  },
  {
    id: 'd3', source: 'gmail', title: 'Lunch?', content_type: 'eml', document_date: '2025-03-01',
    date_is_estimated: false, doc_type: 'email', author: 'james@acme.com',
    is_reviewed: false,
    classification: {
      document_id: 'd3', category_id: null, page_code: null, relevance_score: 0.1,
      is_relevant: false, relevance_explanation: 'Personal communication',
      is_duplicate: false, is_privileged: false, privilege_type: null, privilege_reason: null,
      category_confidence: 0.9, classified_by: 'ai', is_stale: false
    }
  }
];

export const api = {
  getStats: async () => ({
    total_documents: 1247, classified: 1235, relevant: 312, privileged: 23, duplicates: 89, reviewed: 847
  }),
  getBoxes: async () => mockBoxes,
  getCategories: async (boxId?: string) => mockCategories.filter(c => !boxId || c.box_id === boxId),
  getDocuments: async (filters: any = {}) => {
    let items = [...mockDocuments];
    if (filters.category_id !== undefined) {
      items = items.filter(d => d.classification?.category_id === filters.category_id);
    }
    return { items, total: items.length };
  },
  getDocumentDetail: async (id: string): Promise<DocumentDetail> => {
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Not found');
    return {
      ...doc,
      source_id: `src_${id}`, original_path: `/data/${id}.pdf`, ingested_at: '2025-03-08T10:00:00Z',
      metadata: { to: 'tim@firm.com' },
      review: doc.is_reviewed ? { id: 'r1', decision: 'relevant', reviewer: 'tim', created_at: '2025-03-09T10:00:00Z' } : null,
      notes: [], tags: [],
      content: 'This is the mocked content of the document. It contains important information about the case.'
    };
  },
  submitReview: async (id: string, decision: string) => {
    console.log(`Submitted review for ${id}: ${decision}`);
    const doc = mockDocuments.find(d => d.id === id);
    if (doc) doc.is_reviewed = true;
    return { id: 'r_new', decision, reviewer: 'current_user', created_at: new Date().toISOString() };
  },
  addNote: async (id: string, note: string) => {
    console.log(`Added note to ${id}: ${note}`);
    return { id: `n_${Date.now()}`, content: note, author: 'current_user', created_at: new Date().toISOString() };
  },
  addTag: async (id: string, tag: string) => {
    console.log(`Added tag to ${id}: ${tag}`);
    return tag;
  },
  searchDocuments: async (query: string) => {
    console.log(`Searching for: ${query}`);
    if (!query) return { items: mockDocuments, total: mockDocuments.length };
    const lowerQuery = query.toLowerCase();
    const items = mockDocuments.filter(d => 
      d.title.toLowerCase().includes(lowerQuery) || 
      d.author?.toLowerCase().includes(lowerQuery) ||
      d.classification?.page_code?.toLowerCase().includes(lowerQuery)
    );
    return { items, total: items.length };
  },
  moveCategory: async (id: string, categoryId: string) => {
    console.log(`Moved document ${id} to category ${categoryId}`);
    const doc = mockDocuments.find(d => d.id === id);
    if (doc && doc.classification) {
      doc.classification.category_id = categoryId;
    }
    return { success: true };
  }
};
