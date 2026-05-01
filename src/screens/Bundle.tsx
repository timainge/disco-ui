import { CheckCircle2, AlertTriangle, XCircle, FileText, Folder, Download } from 'lucide-react';

export function Bundle() {
  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Bundle Export</h2>
        <p className="text-muted-foreground text-sm mt-1">Pre-flight check and export generation.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="font-semibold mb-5 text-lg">Pre-export checks</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 text-success shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Sequential page numbering complete</div>
              <div className="text-muted-foreground mt-0.5">Pages 1–147 numbered correctly</div>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 text-success shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">All coded documents have a review decision</div>
            </div>
          </div>
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-warning shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-warning">12 documents in staging</div>
              <div className="text-muted-foreground mt-0.5 mb-2">These will be excluded from the bundle.</div>
              <button className="text-xs font-medium text-primary hover:underline">Go to staging →</button>
            </div>
          </div>
          <div className="flex items-start">
            <XCircle className="w-5 h-5 mr-3 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-danger">4 privilege flags not confirmed</div>
              <div className="text-muted-foreground mt-0.5 mb-2">TJB.03.021, TJB.03.022, TJB.03.023, TJB.03.024</div>
              <button className="text-xs font-medium text-primary hover:underline">Go to privilege flags →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Bundle Preview</h3>
        <div className="font-mono text-sm space-y-2 bg-muted/30 p-4 rounded border border-border/50">
          <div className="flex items-center text-primary font-medium"><Folder className="w-4 h-4 mr-2" /> TJB — Smith v Jones</div>
          <div className="ml-4 flex items-center text-muted-foreground"><Folder className="w-4 h-4 mr-2" /> 01 — Correspondence (3 docs, pp 1–3)</div>
          <div className="ml-8 flex items-center text-muted-foreground"><FileText className="w-4 h-4 mr-2" /> TJB.01.001 — Email Tim→James 2025-03-07.eml</div>
          <div className="ml-8 flex items-center text-muted-foreground"><FileText className="w-4 h-4 mr-2" /> TJB.01.002 — Email James→Tim 2025-03-02.eml</div>
          <div className="ml-4 flex items-center text-muted-foreground"><Folder className="w-4 h-4 mr-2" /> 02 — Invoices (2 docs, pp 19–20)</div>
          <div className="ml-4 flex items-center text-muted-foreground"><FileText className="w-4 h-4 mr-2" /> Discovery Index.xlsx</div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-5 py-2.5 border border-border bg-card hover:bg-accent rounded-md text-sm font-medium transition-colors">
          Export Index Only
        </button>
        <button className="flex items-center px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export Bundle
        </button>
      </div>
      <p className="text-right text-xs text-danger mt-2">Fix errors before exporting bundle</p>
    </div>
  );
}
