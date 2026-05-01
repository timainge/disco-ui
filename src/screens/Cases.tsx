import React, { useState } from 'react';
import { Plus, Settings, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { NewCaseWizard } from '@/components/cases/NewCaseWizard';
import { useMatter, useStats } from '@/hooks/queries';

export function Cases() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const setActiveTab = useStore(state => state.setActiveTab);
  const { data: matter, isLoading: matterLoading } = useMatter();
  const { data: stats } = useStats();

  if (isConfiguring) {
    return (
      <NewCaseWizard
        onCancel={() => setIsConfiguring(false)}
        onComplete={() => { setIsConfiguring(false); setActiveTab('dashboard'); }}
      />
    );
  }

  return (
    <div className="h-full w-full bg-background p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matter</h1>
            <p className="text-muted-foreground mt-1">Configure your legal matter and manage data ingestion.</p>
          </div>
          <button
            onClick={() => setIsConfiguring(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Configure Matter
          </button>
        </div>

        {matterLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading matter…
          </div>
        ) : matter ? (
          <div
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer group shadow-sm"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {matter.matter_name || 'Unnamed Matter'}
                  </h3>
                  {matter.matter_reference && (
                    <p className="text-sm text-muted-foreground mt-0.5">{matter.matter_reference}</p>
                  )}
                  {matter.background_context && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl line-clamp-2">
                      {matter.background_context}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground space-x-3 mt-3">
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      {stats?.total_documents?.toLocaleString() ?? '—'} documents
                    </span>
                    {matter.criteria.keywords.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{matter.criteria.keywords.length} keywords</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/20 text-success shrink-0 ml-4">
                Active
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No matter configured</p>
            <p className="text-sm mb-6">Configure a matter to start ingesting and reviewing documents.</p>
            <button
              onClick={() => setIsConfiguring(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm"
            >
              Configure Matter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
