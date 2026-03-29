import { LayoutDashboard, FileText, List, Clock, Archive, Moon, Sun } from 'lucide-react';

export function TopNav({ 
  activeTab, 
  onTabChange, 
  isDarkMode, 
  toggleDarkMode 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Review', icon: FileText },
    { id: 'index', label: 'Index', icon: List },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'bundle', label: 'Bundle', icon: Archive },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
      <div className="flex items-center space-x-6">
        <h1 className="font-semibold text-lg tracking-tight">Smith v Jones — 2024/042</h1>
        <nav className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <div className="text-muted-foreground">847/1247 reviewed (68%)</div>
        <div className="bg-warning/20 text-warning px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
          <span className="w-2 h-2 rounded-full bg-warning mr-1.5 animate-pulse" />
          23 unreviewed
        </div>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button 
          onClick={toggleDarkMode} 
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
