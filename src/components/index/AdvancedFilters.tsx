import { Filter, X } from 'lucide-react';
import { Table } from '@tanstack/react-table';
import { Category, Document } from '@/lib/api';

interface AdvancedFiltersProps {
  table: Table<Document>;
  categories: Category[];
  docTypes: string[];
}

export function AdvancedFilters({ table, categories, docTypes }: AdvancedFiltersProps) {
  const dateColumn = table.getColumn('document_date');
  const docTypeColumn = table.getColumn('doc_type');
  const statusColumn = table.getColumn('classification');
  const categoryColumn = table.getColumn('classification_category_id');

  const dateFilter = (dateColumn?.getFilterValue() as { start?: string, end?: string }) || {};
  
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center">
          <Filter className="w-4 h-4 mr-2 text-primary" />
          Advanced Filters
        </h3>
        <button 
          onClick={() => {
            dateColumn?.setFilterValue(undefined);
            docTypeColumn?.setFilterValue(undefined);
            statusColumn?.setFilterValue(undefined);
            categoryColumn?.setFilterValue(undefined);
          }}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center bg-background border border-border px-2 py-1 rounded-md shadow-sm"
        >
          <X className="w-3 h-3 mr-1" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date Range</label>
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              value={dateFilter.start || ''}
              onChange={e => dateColumn?.setFilterValue({ ...dateFilter, start: e.target.value || undefined })}
              className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow text-foreground"
            />
            <span className="text-muted-foreground text-xs font-medium">to</span>
            <input 
              type="date" 
              value={dateFilter.end || ''}
              onChange={e => dateColumn?.setFilterValue({ ...dateFilter, end: e.target.value || undefined })}
              className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow text-foreground"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Type</label>
          <select 
            value={(docTypeColumn?.getFilterValue() as string) || ''}
            onChange={e => docTypeColumn?.setFilterValue(e.target.value || undefined)}
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow capitalize text-foreground"
          >
            <option value="">All Types</option>
            {docTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Review Status</label>
          <select 
            value={(statusColumn?.getFilterValue() as string) || ''}
            onChange={e => statusColumn?.setFilterValue(e.target.value || undefined)}
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow text-foreground"
          >
            <option value="">All Statuses</option>
            <option value="relevant">Relevant</option>
            <option value="privileged">Privileged</option>
            <option value="unreviewed">Unreviewed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
          <select 
            value={(categoryColumn?.getFilterValue() as string) || ''}
            onChange={e => categoryColumn?.setFilterValue(e.target.value || undefined)}
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow text-foreground"
          >
            <option value="">All Categories</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
