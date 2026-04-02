import { useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Globe, HardDrive, Mail, Calendar, FileText } from 'lucide-react';
import { SourceCard } from './SourceCard';
import { Checkbox } from '@/components/ui/Checkbox';

interface NewCaseWizardProps {
  onCancel: () => void;
  onComplete: () => void;
}

export function NewCaseWizard({ onCancel, onComplete }: NewCaseWizardProps) {
  const [step, setStep] = useState(1);
  
  // Form State
  const [caseName, setCaseName] = useState('');
  const [caseBackground, setCaseBackground] = useState('');
  
  const [sources, setSources] = useState({ google: false, o365: false, local: false });
  const [contentTypes, setContentTypes] = useState({ email: true, calendar: true, files: true });
  
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [queries, setQueries] = useState('');

  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStatus, setIngestStatus] = useState('');

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const startIngest = () => {
    setIsIngesting(true);
    setIngestStatus('Connecting to sources...');
    
    // Mock ingestion process
    setTimeout(() => { setIngestProgress(20); setIngestStatus('Fetching emails and calendar events...'); }, 1500);
    setTimeout(() => { setIngestProgress(45); setIngestStatus('Downloading files...'); }, 3000);
    setTimeout(() => { setIngestProgress(70); setIngestStatus('LLM analyzing relevance based on case background...'); }, 4500);
    setTimeout(() => { setIngestProgress(90); setIngestStatus('Indexing and categorizing...'); }, 6500);
    setTimeout(() => { setIngestProgress(100); setIngestStatus('Complete!'); setTimeout(onComplete, 1000); }, 8000);
  };

  const isStep1Valid = caseName.trim() !== '' && caseBackground.trim() !== '';
  const isStep2Valid = (sources.google || sources.o365 || sources.local) && (contentTypes.email || contentTypes.calendar || contentTypes.files);
  const isStep3Valid = dateRange.start !== '' && dateRange.end !== '';

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold">Create New Case</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-3xl">
          
          {/* Progress Steps */}
          {!isIngesting && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
              
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted-foreground text-muted-foreground'}`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Case Details */}
          {step === 1 && !isIngesting && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-2xl font-bold mb-1">Case Details</h3>
                <p className="text-muted-foreground">Provide the basic information and relevance criteria for the LLM.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Case Name <span className="text-destructive">*</span></label>
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
                  <p className="text-xs text-muted-foreground mb-2">The LLM will use this context to determine if ingested documents are relevant to the case.</p>
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

          {/* Step 2: Sources & Content Types */}
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
                  <SourceCard 
                    icon={<Globe className="w-6 h-6" />} 
                    title="Microsoft 365" 
                    selected={sources.o365} 
                    onClick={() => setSources(s => ({ ...s, o365: !s.o365 }))} 
                  />
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

          {/* Step 3: Filters & Ingest */}
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

          {/* Ingesting State */}
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
              <p className="text-muted-foreground flex items-center">
                {ingestProgress < 100 && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ingestStatus}
              </p>
              
              <div className="w-full max-w-md mt-12 bg-card border border-border rounded-lg p-4 text-sm">
                <h4 className="font-semibold mb-3">Ingestion Summary</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between"><span>Sources:</span> <span className="font-medium text-foreground">{Object.entries(sources).filter(([_, v]) => v).map(([k]) => k).join(', ')}</span></div>
                  <div className="flex justify-between"><span>Types:</span> <span className="font-medium text-foreground">{Object.entries(contentTypes).filter(([_, v]) => v).map(([k]) => k).join(', ')}</span></div>
                  <div className="flex justify-between"><span>Date Range:</span> <span className="font-medium text-foreground">{dateRange.start} to {dateRange.end}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
                  onClick={startIngest}
                  disabled={!isStep3Valid}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
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
