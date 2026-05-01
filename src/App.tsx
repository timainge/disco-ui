import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Cases } from './screens/Cases';
import { Dashboard } from './screens/Dashboard';
import { Review } from './screens/Review';
import { Index } from './screens/Index';
import { Timeline } from './screens/Timeline';
import { Bundle } from './screens/Bundle';
import { TopNav } from './components/layout/TopNav';
import { useStore } from './store/useStore';

const queryClient = new QueryClient();

export default function App() {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
        <TopNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="flex-1 overflow-hidden">
          {activeTab === 'cases' && <Cases />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'review' && <Review />}
          {activeTab === 'index' && <Index />}
          {activeTab === 'timeline' && <Timeline />}
          {activeTab === 'bundle' && <Bundle />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
