import { useState, useMemo } from 'react';
import { Download, Filter, ArrowUpDown, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDocuments, useCategories } from '@/hooks/queries';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  Column,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<any>();

function AdvancedFilters({ table, categories, docTypes }: { table: any, categories: any[], docTypes: string[] }) {
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

export function Index() {
  const { data: docsData } = useDocuments();
  const { data: categories } = useCategories();
  const documents = docsData?.items || [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const docTypes = useMemo(() => {
    const types = new Set(documents.map(d => d.doc_type).filter(Boolean));
    return Array.from(types).sort();
  }, [documents]);

  const columns = useMemo(() => [
    columnHelper.accessor('classification.page_code', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Page Code</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => <span className="font-mono text-xs">{info.getValue() || 'Uncoded'}</span>,
    }),
    columnHelper.accessor('document_date', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Doc Date</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => info.getValue() || '-',
      filterFn: (row, id, value) => {
        const rowDate = row.getValue(id) as string;
        if (!rowDate) return false;
        const { start, end } = value as { start?: string, end?: string };
        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false;
        return true;
      }
    }),
    columnHelper.accessor('doc_type', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Doc Type</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => <span className="capitalize">{info.getValue() || '-'}</span>,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      }
    }),
    columnHelper.accessor('author', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Author</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Title/Subject</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('classification.category_id', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Category</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => {
        const catId = info.getValue();
        const cat = categories?.find(c => c.id === catId);
        return cat ? cat.name : '-';
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      }
    }),
    columnHelper.accessor('classification', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Review</span><ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      ),
      cell: info => {
        const c = info.getValue();
        if (c?.is_relevant) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">Relevant</span>;
        if (c?.is_privileged) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">Privileged</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Unreviewed</span>;
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const c = row.getValue(id) as any;
        let status = 'unreviewed';
        if (c?.is_relevant) status = 'relevant';
        if (c?.is_privileged) status = 'privileged';
        return status === value;
      }
    }),
  ], [categories]);

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
              value={globalFilter ?? ''}
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
        <AdvancedFilters table={table} categories={categories || []} docTypes={docTypes} />
      )}

      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card flex flex-col shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 font-medium align-top">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-xs text-muted-foreground flex justify-between items-center bg-muted/20">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <span className="text-muted-foreground">
              ({table.getFilteredRowModel().rows.length} total rows)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
            >
              {[10, 15, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-1">
              <button
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
