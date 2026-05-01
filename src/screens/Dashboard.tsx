import { useStore } from '@/store/useStore';
import { useStats, useCategories, useDocuments } from '@/hooks/queries';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export function Dashboard() {
  const setActiveTab = useStore(state => state.setActiveTab);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: categories } = useCategories();
  const { data: docsData } = useDocuments();

  if (statsLoading || !stats) return <div className="p-8 flex justify-center text-muted-foreground">Loading dashboard...</div>;

  const documents = docsData?.items || [];
  const stagingDocs = documents.filter(d => !d.classification?.category_id);
  const staleDocs = documents.filter(d => d.classification?.is_stale);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <span className="text-sm text-muted-foreground">Last classified: 2 hours ago</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-muted-foreground mb-1">Total docs</div>
          <div className="text-3xl font-bold">{stats.total_documents}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-between border-success/20 bg-success/5">
          <div className="text-sm font-medium text-success mb-1">Relevant</div>
          <div className="text-3xl font-bold text-success">{stats.relevant}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-between border-warning/20 bg-warning/5">
          <div className="text-sm font-medium text-warning mb-1">Privilege flagged</div>
          <div className="text-3xl font-bold text-warning">{stats.privileged}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-muted-foreground mb-1">Duplicates excluded</div>
          <div className="text-3xl font-bold text-muted-foreground">{stats.duplicates}</div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Review progress</h2>
              <span className="text-sm font-medium">{Math.round((stats.reviewed / stats.total_documents) * 100)}%</span>
            </div>
            <ProgressBar progress={(stats.reviewed / stats.total_documents) * 100} className="h-3" />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">By category</h3>
            <div className="space-y-2">
              {categories?.map(cat => {
                const catDocs = documents.filter(d => d.classification?.category_id === cat.id);
                const total = catDocs.length;
                const reviewed = catDocs.filter(d => d.is_reviewed).length;
                const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
                
                return (
                  <div key={cat.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-accent p-2 rounded-md transition-colors group" onClick={() => setActiveTab('review')}>
                    <span className="w-48 font-medium group-hover:text-primary">{cat.number.toString().padStart(2, '0')} {cat.name}</span>
                    <ProgressBar progress={progress} className="flex-1 mx-4" />
                    <span className="w-24 text-right text-muted-foreground">{progress}% ({reviewed}/{total})</span>
                    <ChevronRight className="w-4 h-4 ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
              
              <div className="flex items-center justify-between text-sm cursor-pointer hover:bg-accent p-2 rounded-md transition-colors group mt-4 border-t border-border pt-2" onClick={() => setActiveTab('review')}>
                <span className="w-48 font-medium text-muted-foreground group-hover:text-primary">Staging</span>
                <div className="flex-1 mx-4 border-t border-dashed border-border"></div>
                <span className="w-24 text-right text-muted-foreground">{stagingDocs.length} docs</span>
                <ChevronRight className="w-4 h-4 ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 p-6 space-y-4 bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
            Needs attention
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start text-warning cursor-pointer hover:underline p-2 -mx-2 rounded hover:bg-warning/10 transition-colors" onClick={() => setActiveTab('review')}>
              <div className="mt-0.5 mr-2">•</div>
              <div>
                <div className="font-medium">{stats.privileged} privilege flags</div>
                <div className="text-warning/80 text-xs mt-0.5">Require confirmation before export</div>
              </div>
            </div>
            <div className="flex items-start text-foreground cursor-pointer hover:underline p-2 -mx-2 rounded hover:bg-accent transition-colors" onClick={() => setActiveTab('review')}>
              <div className="mt-0.5 mr-2">•</div>
              <div>
                <div className="font-medium">{stagingDocs.length} documents in staging</div>
                <div className="text-muted-foreground text-xs mt-0.5">Unclassified by AI</div>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground cursor-pointer hover:underline p-2 -mx-2 rounded hover:bg-accent transition-colors">
              <div className="mt-0.5 mr-2">•</div>
              <div>
                <div className="font-medium">{staleDocs.length} stale classifications</div>
                <div className="text-xs mt-0.5">Criteria changed since last run</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
