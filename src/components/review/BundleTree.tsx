import { useState } from 'react';
import { Search, ChevronDown, CheckCircle2, Lock, HelpCircle } from 'lucide-react';
import { useBoxes, useCategories, useDocuments, useSearchDocuments } from '@/hooks/queries';
import { useStore } from '@/store/useStore';

export function BundleTree() {
  const { data: boxes } = useBoxes();
  const { data: categories } = useCategories();
  const { data: docsData } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useSearchDocuments(searchQuery);
  
  const documents = searchQuery ? (searchResults?.items || []) : (docsData?.items || []);
  const selectedDocId = useStore(state => state.selectedDocId);
  const setSelectedDocId = useStore(state => state.setSelectedDocId);

  return (
    <div className="h-full w-full border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {searchQuery ? (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Search Results</div>
            {documents.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center text-sm p-1.5 rounded cursor-pointer truncate transition-colors ${selectedDocId === doc.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {doc.classification?.is_relevant ? <CheckCircle2 className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-success'}`} /> : 
                 doc.classification?.is_privileged ? <Lock className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-warning'}`} /> :
                 doc.classification?.category_id ? <div className={`w-3.5 h-3.5 mr-2 rounded-full border shrink-0 ${selectedDocId === doc.id ? 'border-primary-foreground/50' : 'border-muted-foreground'}`} /> :
                 <HelpCircle className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} />}
                <span className="truncate font-mono text-xs opacity-70 mr-2">{doc.classification?.page_code?.split('.').pop() || 'Uncoded'}</span>
                <span className="truncate">{doc.title}</span>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-sm text-muted-foreground px-2 py-4 text-center">No documents found.</div>
            )}
          </div>
        ) : (
          boxes?.map(box => (
            <div key={box.id}>
              <div className="flex items-center text-sm font-semibold p-1.5 hover:bg-accent rounded cursor-pointer text-foreground">
                <ChevronDown className="w-4 h-4 mr-1 text-muted-foreground" />
                📦 {box.code}
              </div>
              <div className="ml-5 space-y-1 mt-1">
                {categories?.filter(c => c.box_id === box.id).map(cat => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-sm p-1.5 hover:bg-accent rounded cursor-pointer font-medium text-muted-foreground">
                      <div className="flex items-center">
                        <ChevronDown className="w-4 h-4 mr-1" />
                        {cat.number.toString().padStart(2, '0')} {cat.name}
                      </div>
                    </div>
                    <div className="ml-5 space-y-0.5 mt-0.5">
                      {documents.filter(d => d.classification?.category_id === cat.id).map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`flex items-center text-sm p-1.5 rounded cursor-pointer truncate transition-colors ${selectedDocId === doc.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                        >
                          {doc.classification?.is_relevant ? <CheckCircle2 className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-success'}`} /> : 
                           doc.classification?.is_privileged ? <Lock className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-warning'}`} /> :
                           <div className={`w-3.5 h-3.5 mr-2 rounded-full border shrink-0 ${selectedDocId === doc.id ? 'border-primary-foreground/50' : 'border-muted-foreground'}`} />}
                          <span className="truncate font-mono text-xs opacity-70 mr-2">{doc.classification?.page_code?.split('.').pop()}</span>
                          <span className="truncate">{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Staging */}
                <div className="mt-4 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">── Staging ──</div>
                <div className="ml-1 space-y-0.5">
                  {documents.filter(d => !d.classification?.category_id).map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`flex items-center text-sm p-1.5 rounded cursor-pointer truncate transition-colors ${selectedDocId === doc.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                      <HelpCircle className={`w-3.5 h-3.5 mr-2 shrink-0 ${selectedDocId === doc.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} />
                      <span className="truncate">{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
