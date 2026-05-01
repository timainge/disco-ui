import { Category } from '@/lib/api';

export interface AdvancedFilterState {
  filterDocType: string;
  filterCategoryId: string;
  filterFromDate: string;
  filterToDate: string;
  filterReview: string;
}

export interface AdvancedFilterSetters {
  setFilterDocType: (v: string) => void;
  setFilterCategoryId: (v: string) => void;
  setFilterFromDate: (v: string) => void;
  setFilterToDate: (v: string) => void;
  setFilterReview: (v: string) => void;
}

interface AdvancedFiltersProps {
  categories: Category[];
  docTypes: string[];
  filterState: AdvancedFilterState;
  setFilterState: AdvancedFilterSetters;
}

export function AdvancedFilters({ categories, docTypes, filterState, setFilterState }: AdvancedFiltersProps) {
  const { filterDocType, filterCategoryId, filterFromDate, filterToDate, filterReview } = filterState;
  const { setFilterDocType, setFilterCategoryId, setFilterFromDate, setFilterToDate, setFilterReview } = setFilterState;

  const clearAll = () => {
    setFilterDocType('');
    setFilterCategoryId('');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterReview('');
  };

  return (
    <div className="mb-4 p-4 bg-card border border-border rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Doc Type</label>
          <select
            value={filterDocType}
            onChange={e => setFilterDocType(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All types</option>
            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
          <select
            value={filterCategoryId}
            onChange={e => setFilterCategoryId(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
          <input
            type="date"
            value={filterFromDate}
            onChange={e => setFilterFromDate(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
          <input
            type="date"
            value={filterToDate}
            onChange={e => setFilterToDate(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Review Status</label>
          <select
            value={filterReview}
            onChange={e => setFilterReview(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="relevant">Relevant</option>
            <option value="privileged">Privileged</option>
            <option value="unreviewed">Unreviewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
