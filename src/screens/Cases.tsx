import React, { useState } from 'react';
import { Plus, Folder, Search, MoreVertical, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { NewCaseWizard } from '@/components/cases/NewCaseWizard';

export function Cases() {
  const [isCreating, setIsCreating] = useState(false);
  const setActiveTab = useStore(state => state.setActiveTab);

  const mockCases = [
    { id: '1', name: 'Smith v Jones — 2024/042', status: 'Active', docs: 1247, date: '2024-03-15' },
    { id: '2', name: 'Acme Corp Merger', status: 'Processing', docs: 8530, date: '2024-03-28' },
    { id: '3', name: 'Project Phoenix Audit', status: 'Closed', docs: 412, date: '2023-11-02' },
  ];

  if (isCreating) {
    return <NewCaseWizard onCancel={() => setIsCreating(false)} onComplete={() => { setIsCreating(false); setActiveTab('dashboard'); }} />;
  }

  return (
    <div className="h-full w-full bg-background p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
            <p className="text-muted-foreground mt-1">Manage your legal matters and investigations.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search cases..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
          />
        </div>

        <div className="grid gap-4">
          {mockCases.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-5 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group shadow-sm" onClick={() => setActiveTab('dashboard')}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{c.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground space-x-3 mt-1">
                    <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1" /> {c.docs.toLocaleString()} documents</span>
                    <span>•</span>
                    <span>Created {c.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  c.status === 'Active' ? 'bg-success/20 text-success' : 
                  c.status === 'Processing' ? 'bg-warning/20 text-warning animate-pulse' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {c.status}
                </span>
                <button className="p-2 hover:bg-accent rounded-md text-muted-foreground transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
