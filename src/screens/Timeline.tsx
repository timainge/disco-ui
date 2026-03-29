import { Calendar, Mail, FileText, File, Clock } from 'lucide-react';
import { useDocuments } from '@/hooks/queries';
import { useStore } from '@/store/useStore';
import { Document } from '@/lib/api';
import { differenceInDays } from 'date-fns';

export function Timeline() {
  const { data: docsData } = useDocuments();
  const setActiveTab = useStore(state => state.setActiveTab);
  const setSelectedDocId = useStore(state => state.setSelectedDocId);

  const docs = [...(docsData?.items || [])]
    .filter(d => d.document_date)
    .sort((a, b) => new Date(b.document_date!).getTime() - new Date(a.document_date!).getTime());
  
  const grouped = docs.reduce((acc, doc) => {
    const date = new Date(doc.document_date!);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const handleDocClick = (id: string) => {
    setSelectedDocId(id);
    setActiveTab('review');
  };

  const getDocIcon = (type: string | null) => {
    if (type === 'email') return <Mail className="w-4 h-4" />;
    if (type === 'contract') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const renderGap = (currentDoc: Document, nextDoc: Document | undefined) => {
    if (!nextDoc) return null;
    const days = differenceInDays(new Date(currentDoc.document_date!), new Date(nextDoc.document_date!));
    if (days > 14) { // Show gap if more than 2 weeks
      return (
        <div className="relative flex items-center justify-center my-4 group w-full">
          <div className="absolute inset-x-0 top-1/2 h-px bg-border/50 border-dashed border-t"></div>
          <div className="bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full z-10 relative flex items-center border border-border/50 shadow-sm">
            <Clock className="w-3 h-3 mr-1.5" />
            {days} Day Gap
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
        <p className="text-muted-foreground text-sm mt-1">Chronological view of documents.</p>
      </div>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        
        {Object.entries(grouped).map(([monthYear, monthDocs], monthIndex, monthEntries) => (
          <div key={monthYear} className="relative">
            <div className="md:flex items-center justify-center mb-6">
              <div className="bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full z-10 relative shadow-sm border border-border/50">{monthYear}</div>
            </div>
            
            <div className="space-y-6">
              {monthDocs.map((doc, index) => {
                // Find the next document chronologically (which is the next one in the array since it's sorted desc)
                const nextDoc = index < monthDocs.length - 1 
                  ? monthDocs[index + 1] 
                  : (monthIndex < monthEntries.length - 1 ? monthEntries[monthIndex + 1][1][0] : undefined);

                return (
                  <div key={doc.id} className="flex flex-col">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer w-full" onClick={() => handleDocClick(doc.id)}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 ${doc.classification?.is_relevant ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {getDocIcon(doc.doc_type)}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-lg border border-border shadow-sm hover:border-primary/50 transition-colors group-hover:shadow-md">
                        <div className="flex items-center justify-between mb-1">
                          <time className="text-sm font-bold text-primary">
                            {new Date(doc.document_date!).toLocaleDateString('default', { day: '2-digit', month: 'short' })}
                          </time>
                          <span className="text-xs font-mono text-muted-foreground">{doc.classification?.page_code || 'Uncoded'}</span>
                        </div>
                        <div className="text-sm font-medium mb-1 truncate">{doc.title}</div>
                        <div className="flex items-center space-x-2 text-xs">
                          {doc.classification?.is_relevant && <span className="text-success font-medium">Relevant</span>}
                          {doc.classification?.is_privileged && <span className="text-warning font-medium">Privileged</span>}
                          {!doc.classification?.is_relevant && !doc.classification?.is_privileged && <span className="text-muted-foreground font-medium">Not Relevant</span>}
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground truncate capitalize">{doc.doc_type}</span>
                        </div>
                      </div>
                    </div>
                    {renderGap(doc, nextDoc)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length > 0 && (
          <div className="relative">
            <div className="md:flex items-center justify-center my-8">
              <div className="bg-warning/10 text-warning border border-warning/20 text-xs font-medium px-4 py-2 rounded-full z-10 relative flex items-center shadow-sm">
                <Calendar className="w-3.5 h-3.5 mr-2" />
                End of timeline
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
