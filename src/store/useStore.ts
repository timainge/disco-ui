import { create } from 'zustand';

interface AppState {
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedDocId: null,
  setSelectedDocId: (id) => set({ selectedDocId: id }),
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
