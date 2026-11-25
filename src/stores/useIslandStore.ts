import { create } from 'zustand';
import { LiveActivity } from '../types';

interface IslandState {
  isExpanded: boolean;
  isPinned: boolean;
  isInteracting: boolean;
  isRetracted: boolean;
  isAiWhisperOpen: boolean;
  activeModule: string;
  liveActivity: LiveActivity | null;
  recentActivities: LiveActivity[];

  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setPinned: (pinned: boolean) => void;
  setInteracting: (interacting: boolean) => void;
  setRetracted: (retracted: boolean) => void;
  toggleRetracted: () => void;
  setAiWhisperOpen: (open: boolean) => void;
  toggleAiWhisper: () => void;
  setActiveModule: (moduleId: string) => void;
  setLiveActivity: (activity: LiveActivity | null) => void;
  dismissLiveActivity: () => void;
}

export const useIslandStore = create<IslandState>((set) => ({
  isExpanded: false, // Default to sleek rounded capsule pill
  isPinned: false,
  isInteracting: false,
  isRetracted: false,
  isAiWhisperOpen: false,
  activeModule: 'home',
  liveActivity: null,
  recentActivities: [],

  setExpanded: (expanded) => set({ isExpanded: expanded }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setPinned: (pinned) => set({ isPinned: pinned }),
  setInteracting: (interacting) => set({ isInteracting: interacting }),
  setRetracted: (retracted) => set({ isRetracted: retracted }),
  toggleRetracted: () => set((state) => ({ isRetracted: !state.isRetracted })),
  setAiWhisperOpen: (open) => set({ isAiWhisperOpen: open }),
  toggleAiWhisper: () => set((state) => ({ isAiWhisperOpen: !state.isAiWhisperOpen })),
  setActiveModule: (moduleId) => set({ activeModule: moduleId }),
  setLiveActivity: (activity) =>
    set((state) => ({
      liveActivity: activity,
      recentActivities: activity
        ? [activity, ...state.recentActivities.slice(0, 9)]
        : state.recentActivities,
    })),
  dismissLiveActivity: () => set({ liveActivity: null }),
}));
