import { useState, useEffect } from 'react';
import { useDocuments, useSearchDocuments } from '@/hooks/queries';
import { useStore } from '@/store/useStore';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle2, Lock, HelpCircle, ArrowUpDown, Search } from 'lucide-react';

const columnHelper = createColumnHelper<any>();

export function DocumentList() {
  const { data: docsData } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useSearchDocuments(searchQuery);
  const documents = searchQuery ? (searchResults?.items || []) : (docsData?.items || []);
  const selectedDocId = useStore(state => state.selectedDocId);
  const setSelectedDocId = useStore(state => state.setSelectedDocId);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.accessor('classification.page_code', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Page</span>
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => <span className="font-mono text-xs opacity-70">{info.getValue()?.split('.').pop() || 'Uncoded'}</span>,
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Title</span>
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: info => <span className="truncate block max-w-[150px]" title={info.getValue()}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('classification.is_relevant', {
      header: 'Status',
      cell: ({ row }) => {
        const doc = row.original;
        if (doc.classification?.is_relevant) return <CheckCircle2 className="w-4 h-4 text-success" />;
        if (doc.classification?.is_privileged) return <Lock className="w-4 h-4 text-warning" />;
        if (doc.classification?.category_id) return <div className="w-4 h-4 rounded-full border border-muted-foreground" />;
        return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
      },
    }),
  ];

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const rows = table.getRowModel().rows;
        if (rows.length === 0) return;

        const currentIndex = rows.findIndex(r => r.original.id === selectedDocId);
        
        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndex < rows.length - 1 ? currentIndex + 1 : 0;
          setSelectedDocId(rows[nextIndex].original.id);
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : rows.length - 1;
          setSelectedDocId(rows[prevIndex].original.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocId, table, setSelectedDocId]);

  return (
    <div className="h-full w-full border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
          />
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Document List (Press T to toggle tree)
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-2 font-medium">
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
              <tr
                key={row.id}
                onClick={() => setSelectedDocId(row.original.id)}
                className={`cursor-pointer transition-colors ${
                  selectedDocId === row.original.id
                    ? 'bg-primary/10 text-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
