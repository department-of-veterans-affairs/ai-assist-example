import { create } from 'zustand';

interface LayoutState {
  leftCollapsed: boolean;
  toggleLeftSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  leftCollapsed: false,
  toggleLeftSidebar: () =>
    set((state) => ({ leftCollapsed: !state.leftCollapsed })),
}));
