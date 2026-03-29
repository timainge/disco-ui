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

function FilterInput({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <div className="mt-2 relative">
      <input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={`Filter...`}
        className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
      />
      {columnFilterValue && (
        <button 
          onClick={() => column.setFilterValue('')}
          className="absolute right-1.5 top-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </button>
      )}
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

  const columns = useMemo(() => [
    columnHelper.accessor('classification.page_code', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Page Code</span><ArrowUpDown className="w-3 h-3" />
          </button>
          {showFilters && <FilterInput column={column} />}
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
          {showFilters && <FilterInput column={column} />}
        </div>
      ),
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('doc_type', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Doc Type</span><ArrowUpDown className="w-3 h-3" />
          </button>
          {showFilters && <FilterInput column={column} />}
        </div>
      ),
      cell: info => <span className="capitalize">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('author', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Author</span><ArrowUpDown className="w-3 h-3" />
          </button>
          {showFilters && <FilterInput column={column} />}
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
          {showFilters && <FilterInput column={column} />}
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
          {showFilters && <FilterInput column={column} />}
        </div>
      ),
      cell: info => {
        const catId = info.getValue();
        const cat = categories?.find(c => c.id === catId);
        return cat ? cat.name : '-';
      },
      filterFn: (row, id, value) => {
        const catId = row.getValue(id);
        const cat = categories?.find(c => c.id === catId);
        const catName = cat ? cat.name.toLowerCase() : '';
        return catName.includes((value as string).toLowerCase());
      }
    }),
    columnHelper.accessor('classification', {
      header: ({ column }) => (
        <div className="flex flex-col">
          <button className="flex items-center space-x-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span>Review</span><ArrowUpDown className="w-3 h-3" />
          </button>
          {showFilters && <FilterInput column={column} />}
        </div>
      ),
      cell: info => {
        const c = info.getValue();
        if (c?.is_relevant) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">Relevant</span>;
        if (c?.is_privileged) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">Privileged</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Unreviewed</span>;
      },
      filterFn: (row, id, value) => {
        const c = row.getValue(id) as any;
        let status = 'unreviewed';
        if (c?.is_relevant) status = 'relevant';
        if (c?.is_privileged) status = 'privileged';
        return status.includes((value as string).toLowerCase());
      }
    }),
  ], [categories, showFilters]);

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
