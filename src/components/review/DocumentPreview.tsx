import { useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useDocumentDetail } from '@/hooks/queries';
import { useStore } from '@/store/useStore';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker URL for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DocumentPreview() {
  const selectedDocId = useStore(state => state.selectedDocId);
  const { data: docDetail } = useDocumentDetail(selectedDocId);
  
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  // Mock PDF URL for demonstration if content_type is pdf
  const isPdf = docDetail?.content_type === 'pdf';
  const pdfUrl = isPdf ? 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' : null;

  return (
    <div className="flex-1 flex flex-col bg-muted/20 relative h-full overflow-hidden">
      {docDetail ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Toolbar */}
          <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium truncate max-w-[300px]">{docDetail.title}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">{docDetail.content_type}</span>
            </div>
            
            {isPdf && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-muted/50 rounded-md border border-border/50 p-0.5">
                  <button onClick={zoomOut} className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                  <button onClick={zoomIn} className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <button onClick={resetZoom} className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-colors" title="Reset Zoom">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={previousPage} 
                    disabled={pageNumber <= 1}
                    className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono">
                    {pageNumber} / {numPages || '--'}
                  </span>
                  <button 
                    onClick={nextPage} 
                    disabled={pageNumber >= (numPages || 1)}
                    className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 flex justify-center bg-muted/30">
            {isPdf ? (
              <div className="shadow-lg border border-border/50 bg-white inline-block">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-12 text-muted-foreground flex items-center"><FileText className="w-5 h-5 mr-2 animate-pulse" /> Loading PDF...</div>}
                  error={<div className="p-12 text-destructive">Failed to load PDF.</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full"
                  />
                </Document>
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-card border border-border shadow-sm min-h-[800px] flex flex-col">
                {/* Document Header (Email style) */}
                <div className="p-6 border-b border-border bg-muted/10">
                  <h2 className="text-xl font-bold mb-4">{docDetail.title}</h2>
                  <div className="grid grid-cols-[60px_1fr] gap-x-4 gap-y-1 text-sm">
                    <div className="text-muted-foreground font-medium">From:</div><div>{docDetail.author}</div>
                    <div className="text-muted-foreground font-medium">To:</div><div>{docDetail.metadata?.to}</div>
                    <div className="text-muted-foreground font-medium">Date:</div><div>{docDetail.document_date}</div>
                  </div>
                </div>
                {/* Document Body */}
                <div className="p-8 flex-1 prose prose-sm dark:prose-invert max-w-none">
                  {docDetail.content}
                </div>
              </div>
            )}
          </div>
          
          {/* Page Number Overlay */}
          <div className="absolute bottom-6 right-6 bg-card/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded shadow-sm text-xs font-mono text-muted-foreground z-10">
            {docDetail.classification?.page_code || 'Uncoded'}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Select a document to preview</p>
          </div>
        </div>
      )}
    </div>
  );
}
