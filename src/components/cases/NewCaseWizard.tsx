import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Globe, HardDrive, Mail, Calendar, FileText } from 'lucide-react';
import { SourceCard } from './SourceCard';
import { Checkbox } from '@/components/ui/Checkbox';
import { useUpdateMatter, useStartIngest, useIngestJob } from '@/hooks/queries';

interface NewCaseWizardProps {
  onCancel: () => void;
  onComplete: () => void;
}

export function NewCaseWizard({ onCancel, onComplete }: NewCaseWizardProps) {
  const [step, setStep] = useState(1);

  const [caseName, setCaseName] = useState('');
  const [caseBackground, setCaseBackground] = useState('');

  const [sources, setSources] = useState({ google: false, local: false });
  const [contentTypes, setContentTypes] = useState({ email: true, calendar: true, files: true });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [queries, setQueries] = useState('');

  const [jobId, setJobId] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const updateMatter = useUpdateMatter();
  const startIngest = useStartIngest();
  const { data: job } = useIngestJob(jobId);

  useEffect(() => {
    if (job?.status === 'complete') {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
    if (job?.status === 'failed') {
      setIngestError(job.error ?? 'Ingestion failed');
    }
  }, [job?.status, onComplete]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const startIngestion = async () => {
    setIngestError(null);
    try {
      await updateMatter.mutateAsync({
        matter_name: caseName,
        background_context: caseBackground,
      });

      const selectedSource = sources.google ? 'google' : sources.local ? 'local' : undefined;
      const { job_id } = await startIngest.mutateAsync({
        source: selectedSource,
        from_date: dateRange.start || undefined,
        to_date: dateRange.end || undefined,
      });
      setJobId(job_id);
    } catch (err: any) {
      setIngestError(err.message ?? 'Failed to start ingestion');
    }
  };

  const isIngesting = !!jobId;
  const ingestProgress = !job ? 0
    : job.status === 'complete' ? 100
    : job.progress?.total
      ? Math.round((job.progress.processed / job.progress.total) * 100)
      : job.status === 'running' ? 50
      : 0;

  const ingestStatus = !job ? 'Starting…'
    : job.status === 'complete' ? 'Complete!'
    : job.status === 'failed' ? (job.error ?? 'Failed')
    : job.progress ? `${job.progress.source}: ${job.progress.processed} processed…`
    : 'Running…';

  const isStep1Valid = caseName.trim() !== '' && caseBackground.trim() !== '';
  const isStep2Valid = sources.google || sources.local;
  const isStep3Valid = dateRange.start !== '' && dateRange.end !== '';

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold">Configure Matter</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-3xl">

          {!isIngesting && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted-foreground text-muted-foreground'}`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
              ))}
            </div>
          )}

          {step === 1 && !isIngesting && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-2xl font-bold mb-1">Matter Details</h3>
                <p className="text-muted-foreground">Provide the basic information and relevance criteria for the LLM.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Matter Name <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={caseName}
                    onChange={e => setCaseName(e.target.value)}
                    placeholder="e.g., Smith v Jones — 2024/042"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Background & Relevance Criteria <span className="text-destructive">*</span></label>
                  <p className="text-xs text-muted-foreground mb-2">The LLM will use this context to determine if ingested documents are relevant.</p>
                  <textarea
                    value={caseBackground}
                    onChange={e => setCaseBackground(e.target.value)}
                    placeholder="Describe the case background, key entities, and what makes a document relevant..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none min-h-[150px] resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && !isIngesting && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-2xl font-bold mb-1">Data Sources</h3>
                <p className="text-muted-foreground">Select where to ingest data from and what types of content to include.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Content Sources <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-3 gap-4">
                  <SourceCard
                    icon={<Globe className="w-6 h-6" />}
                    title="Google Workspace"
                    selected={sources.google}
                    onClick={() => setSources(s => ({ ...s, google: !s.google }))}
                  />
                  <div className="relative">
                    <SourceCard
                      icon={<Globe className="w-6 h-6" />}
                      title="Microsoft 365"
                      selected={false}
                      onClick={() => {}}
                    />
                    <div className="absolute inset-0 rounded-lg bg-background/70 flex items-center justify-center cursor-not-allowed">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded border border-border">Coming soon</span>
                    </div>
                  </div>
                  <SourceCard
                    icon={<HardDrive className="w-6 h-6" />}
                    title="Local Upload"
                    selected={sources.local}
                    onClick={() => setSources(s => ({ ...s, local: !s.local }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Content Types <span className="text-destructive">*</span></label>
                <div className="flex space-x-6">
                  <Checkbox label="Emails" icon={<Mail className="w-4 h-4 mr-2" />} checked={contentTypes.email} onChange={() => setContentTypes(c => ({ ...c, email: !c.email }))} />
                  <Checkbox label="Calendar Events" icon={<Calendar className="w-4 h-4 mr-2" />} checked={contentTypes.calendar} onChange={() => setContentTypes(c => ({ ...c, calendar: !c.calendar }))} />
                  <Checkbox label="Files & Documents" icon={<FileText className="w-4 h-4 mr-2" />} checked={contentTypes.files} onChange={() => setContentTypes(c => ({ ...c, files: !c.files }))} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && !isIngesting && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-2xl font-bold mb-1">Ingestion Filters</h3>
                <p className="text-muted-foreground">Narrow down the data to be ingested before LLM relevance analysis.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Start Date <span className="text-destructive">*</span></label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End Date <span className="text-destructive">*</span></label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Queries & Keywords (Optional)</label>
                <p className="text-xs text-muted-foreground mb-2">Pre-filter documents before LLM analysis to save processing time.</p>
                <textarea
                  value={queries}
                  onChange={e => setQueries(e.target.value)}
                  placeholder="e.g., from:johndoe@example.com OR subject:'merger'"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px] resize-y font-mono text-sm"
                />
              </div>
            </div>
          )}

          {isIngesting && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="w-24 h-24 mb-8 relative">
                <svg className="w-full h-full text-muted" viewBox="0 0 100 100">
                  <circle className="stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                </svg>
                <svg className="w-full h-full text-primary absolute top-0 left-0 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="stroke-current transition-all duration-500 ease-out"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * ingestProgress) / 100}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                  {ingestProgress}%
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Ingesting Data</h3>
              <p className={`flex items-center ${job?.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {job?.status === 'running' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ingestStatus}
              </p>

              {ingestError && (
                <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-2">
                  {ingestError}
                </div>
              )}

              {job?.status === 'complete' && job.results && (
                <div className="w-full max-w-md mt-8 bg-card border border-border rounded-lg p-4 text-sm">
                  <h4 className="font-semibold mb-3">Ingestion Summary</h4>
                  <div className="space-y-2">
                    {job.results.map(r => (
                      <div key={r.source} className="space-y-1">
                        <div className="font-medium capitalize">{r.source}</div>
                        <div className="grid grid-cols-3 gap-2 text-muted-foreground text-xs pl-2">
                          <span>Ingested: {r.documents_ingested}</span>
                          <span>Updated: {r.documents_updated}</span>
                          <span>Skipped: {r.documents_skipped}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!job?.results && (
                <div className="w-full max-w-md mt-12 bg-card border border-border rounded-lg p-4 text-sm">
                  <h4 className="font-semibold mb-3">Ingestion Summary</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sources:</span>
                      <span className="font-medium text-foreground">
                        {Object.entries(sources).filter(([, v]) => v).map(([k]) => k).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date Range:</span>
                      <span className="font-medium text-foreground">{dateRange.start} to {dateRange.end}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isIngesting && (
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-4 py-2 rounded-md font-medium flex items-center text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={startIngestion}
                  disabled={!isStep3Valid || startIngest.isPending || updateMatter.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {(startIngest.isPending || updateMatter.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Start Ingestion
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
