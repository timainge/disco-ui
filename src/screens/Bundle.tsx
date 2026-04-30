import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Folder, Download, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useBoxes, useCategories, useDocuments, useStartBundleExport, useBundleJob } from '@/hooks/queries';
import { api, BundleValidation } from '@/lib/api';

export function Bundle() {
  const { data: boxes } = useBoxes();
  const { data: categories } = useCategories();
  const { data: docsData } = useDocuments();

  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set());

  const [validation, setValidation] = useState<BundleValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [showConfirmExport, setShowConfirmExport] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const { data: bundleJob } = useBundleJob(jobId);
  const startExport = useStartBundleExport();

  const documents = docsData?.items ?? [];

  const toggleBox = (boxId: string) => {
    setExpandedBoxes(prev => {
      const next = new Set(prev);
      if (next.has(boxId)) next.delete(boxId); else next.add(boxId);
      return next;
    });
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidateError(null);
    setValidation(null);
    try {
      const result = await api.validateBundle();
      setValidation(result);
      if (result.valid && result.warnings.length === 0) {
        setShowConfirmExport(true);
      }
    } catch (err: any) {
      setValidateError(err.message ?? 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleExport = async () => {
    setShowConfirmExport(false);
    try {
      const { job_id } = await startExport.mutateAsync({});
      setJobId(job_id);
    } catch (err: any) {
      setValidateError(err.message ?? 'Export failed');
    }
  };

  const selectedBoxCategories = selectedBoxId
    ? (categories?.filter(c => c.box_id === selectedBoxId) ?? [])
    : [];

  const isExporting = bundleJob?.status === 'running';
  const exportDone = bundleJob?.status === 'complete';
  const exportFailed = bundleJob?.status === 'failed';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: boxes */}
      <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Boxes</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {boxes?.map(box => (
            <button
              key={box.id}
              onClick={() => setSelectedBoxId(box.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${selectedBoxId === box.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <Folder className="w-4 h-4 mr-2 shrink-0" />
              {box.code} — {box.label}
            </button>
          ))}
          {!boxes?.length && (
            <p className="text-xs text-muted-foreground px-3 py-2">No boxes found.</p>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Bundle Export</h2>
          <p className="text-muted-foreground text-sm mt-1">Pre-flight check and export generation.</p>
        </div>

        {/* Category + document tree for selected box */}
        {selectedBoxId && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">
              {boxes?.find(b => b.id === selectedBoxId)?.code} — Contents
            </h3>
            <div className="font-mono text-sm space-y-1">
              {selectedBoxCategories.map(cat => {
                const catDocs = documents.filter(d => d.classification?.category_id === cat.id);
                const isExpanded = expandedBoxes.has(cat.id);
                return (
                  <div key={cat.id}>
                    <button
                      className="flex items-center text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                      onClick={() => toggleBox(cat.id)}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 mr-1 shrink-0" /> : <ChevronRight className="w-4 h-4 mr-1 shrink-0" />}
                      <Folder className="w-4 h-4 mr-2 shrink-0" />
                      {cat.number.toString().padStart(2, '0')} — {cat.name}
                      <span className="ml-2 text-xs opacity-60">({catDocs.length} docs)</span>
                    </button>
                    {isExpanded && catDocs.map(doc => (
                      <div key={doc.id} className="ml-8 flex items-center text-muted-foreground py-0.5">
                        <FileText className="w-4 h-4 mr-2 shrink-0" />
                        <span className="opacity-70 mr-2">{doc.classification?.page_code || 'Uncoded'}</span>
                        <span className="truncate">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {selectedBoxCategories.length === 0 && (
                <p className="text-muted-foreground text-xs">No categories in this box.</p>
              )}
            </div>
          </div>
        )}

        {/* Validation results */}
        {validation && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-5 text-lg">Pre-export checks</h3>
            <div className="space-y-4 text-sm">
              {validation.valid && validation.errors.length === 0 ? (
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-success shrink-0 mt-0.5" />
                  <div className="font-medium">All checks passed</div>
                </div>
              ) : null}
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-3 text-warning shrink-0 mt-0.5" />
                  <div className="font-medium text-warning">{w}</div>
                </div>
              ))}
              {validation.errors.map((e, i) => (
                <div key={i} className="flex items-start">
                  <XCircle className="w-5 h-5 mr-3 text-destructive shrink-0 mt-0.5" />
                  <div className="font-medium text-destructive">{e}</div>
                </div>
              ))}
            </div>

            {validation.valid && validation.warnings.length > 0 && !showConfirmExport && (
              <div className="mt-4">
                <button
                  onClick={() => setShowConfirmExport(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Proceed anyway →
                </button>
              </div>
            )}
          </div>
        )}

        {validateError && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-2">
            {validateError}
          </div>
        )}

        {/* Export job progress */}
        {jobId && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-3 text-lg flex items-center">
              {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {exportDone ? 'Export complete' : exportFailed ? 'Export failed' : 'Exporting…'}
            </h3>
            {exportDone && bundleJob?.result?.output_dir && (
              <p className="text-sm text-muted-foreground">
                Output: <span className="font-mono text-foreground">{bundleJob.result.output_dir}</span>
              </p>
            )}
            {exportFailed && (
              <p className="text-sm text-destructive">{bundleJob?.error ?? 'Unknown error'}</p>
            )}
          </div>
        )}

        {/* Confirm export dialog */}
        {showConfirmExport && (
          <div className="bg-card border border-warning/30 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-2">Confirm export</h3>
            {validation?.warnings && validation.warnings.length > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                There are {validation.warnings.length} warning(s). Do you want to export anyway?
              </p>
            )}
            <div className="flex space-x-3">
              <button onClick={handleExport} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Export now
              </button>
              <button onClick={() => setShowConfirmExport(false)} className="px-4 py-2 border border-border bg-card rounded-md text-sm font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!jobId && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="flex items-center px-5 py-2.5 border border-border bg-card hover:bg-accent rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {validating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Validate
            </button>
            <button
              onClick={() => { handleValidate().then(() => {}); }}
              disabled={validating || startExport.isPending}
              className={`flex items-center px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors ${(!validation?.valid) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!validation ? 'Validate first' : !validation.valid ? 'Fix errors before exporting' : ''}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Bundle
            </button>
          </div>
        )}
        {!jobId && validation && !validation.valid && (
          <p className="text-right text-xs text-destructive mt-2">Fix errors before exporting bundle</p>
        )}
      </div>
    </div>
  );
}
