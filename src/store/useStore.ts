import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedDocId: null,
      setSelectedDocId: (id) => set({ selectedDocId: id }),
      activeTab: 'cases',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'disco-ui',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    },
  ),
);
