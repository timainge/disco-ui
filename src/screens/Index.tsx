import { useState, useMemo, useEffect } from 'react';
import { Download, Filter, ArrowUpDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDocuments, useSearchDocuments, useCategories, useSearchFacets } from '@/hooks/queries';
import { Document, DocumentFilters } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { AdvancedFilters, AdvancedFilterState, AdvancedFilterSetters } from '@/components/index/AdvancedFilters';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Document>();


const PAGE_SIZE_OPTIONS = [10, 15, 20, 30, 40, 50];
const DEFAULT_PAGE_SIZE = 15;

export function Index() {
  const { data: categories } = useCategories();
  const { data: facets } = useSearchFacets();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Column filters for advanced filter panel (doc_type, category_id, date range)
  const [filterDocType, setFilterDocType] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterReview, setFilterReview] = useState('');

  const debouncedQuery = useDebounce(globalFilter.trim(), 300);

  const docFilters: DocumentFilters = {
    limit: pageSize,
    offset: pageIndex * pageSize,
    ...(filterDocType && { content_type: filterDocType }),
    ...(filterCategoryId && { category_id: filterCategoryId }),
    ...(filterFromDate && { from_date: filterFromDate }),
    ...(filterToDate && { to_date: filterToDate }),
    ...(filterReview === 'relevant' && { is_relevant: true }),
    ...(filterReview === 'privileged' && { is_privileged: true }),
    ...(filterReview === 'unreviewed' && { has_review: false }),
  };

  const { data: docsData } = useDocuments(docFilters, { enabled: !debouncedQuery });
  const { data: searchResults } = useSearchDocuments(debouncedQuery);

  const documents: Document[] = debouncedQuery
    ? (searchResults?.map(r => r.document) ?? [])
    : (docsData?.items ?? []);

  const total = debouncedQuery ? documents.length : (docsData?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const docTypes = useMemo(() => {
    if (facets?.content_type) return Object.keys(facets.content_type).sort();
    return [];
  }, [facets]);

  const columns = useMemo(() => [
    columnHelper.accessor('classification.page_code', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Page Code</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => <span className="font-mono text-xs">{info.getValue() || 'Uncoded'}</span>,
    }),
    columnHelper.accessor('document_date', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Doc Date</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('doc_type', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Doc Type</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => <span className="capitalize">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('author', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Author</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('addressee', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Addressee</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Title/Subject</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('classification.category_id', {
      header: ({ column }) => (
        <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Category</span><ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => {
        const cat = categories?.find(c => c.id === info.getValue());
        return cat ? cat.name : '-';
      },
    }),
    columnHelper.accessor('classification', {
      header: () => <span>Review</span>,
      cell: info => {
        const c = info.getValue();
        if (c?.is_relevant) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">Relevant</span>;
        if (c?.is_privileged) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">Privileged</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Unreviewed</span>;
      },
    }),
  ], [categories]);

  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting },
    manualPagination: true,
    pageCount,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  // Reset to page 0 when filters/search change
  useEffect(() => { setPageIndex(0); }, [debouncedQuery, filterDocType, filterCategoryId, filterFromDate, filterToDate, filterReview]);

  const filterState: AdvancedFilterState = { filterDocType, filterCategoryId, filterFromDate, filterToDate, filterReview };
  const setFilterState: AdvancedFilterSetters = { setFilterDocType, setFilterCategoryId, setFilterFromDate, setFilterToDate, setFilterReview };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discovery Index</h2>
          <p className="text-muted-foreground text-sm mt-1">Full spreadsheet view of the discovery index.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Global search..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-64"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background text-foreground border-border hover:bg-accent'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {showFilters && (
        <AdvancedFilters
          categories={categories || []}
          docTypes={docTypes}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      )}

      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card flex flex-col shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 font-medium align-top">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-xs text-muted-foreground flex justify-between items-center bg-muted/20">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <span className="text-muted-foreground">
              ({total} total rows)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
              className="bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>Show {s}</option>
              ))}
            </select>
            <div className="flex items-center space-x-1">
              <button className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPageIndex(0)} disabled={!canPrev}><ChevronsLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPageIndex(i => i - 1)} disabled={!canPrev}><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPageIndex(i => i + 1)} disabled={!canNext}><ChevronRight className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPageIndex(pageCount - 1)} disabled={!canNext}><ChevronsRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

