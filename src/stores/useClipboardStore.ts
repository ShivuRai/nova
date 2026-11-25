import { create } from 'zustand';
import { ClipboardItem } from '../types';

const KEY = 'nova_clipboard_history';
const CAPTURE_KEY = 'nova_clipboard_capture';

function loadClips(): ClipboardItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(saved)) return saved.filter((item) => typeof item?.textContent === 'string');
  } catch {}
  return [];
}

interface ClipboardState {
  items: ClipboardItem[];
  captureEnabled: boolean;
  setCaptureEnabled: (enabled: boolean) => void;
  capture: (text: string, timestamp: number) => void;
  setItems: (items: ClipboardItem[]) => void;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  items: loadClips(),
  captureEnabled: localStorage.getItem(CAPTURE_KEY) !== 'off',
  setCaptureEnabled: (enabled) => {
    localStorage.setItem(CAPTURE_KEY, enabled ? 'on' : 'off');
    set({ captureEnabled: enabled });
  },
  setItems: (items) => {
    set({ items });
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  },
  capture: (text, timestamp) => {
    const { items, captureEnabled, setItems } = get();
    if (!captureEnabled || !text.trim() || text.length > 100000 || items[0]?.textContent === text) return;
    const existing = items.find((item) => item.textContent === text);
    const entry = {
      id: 'clip-' + crypto.randomUUID(),
      contentType: /^https?:\/\//i.test(text.trim()) ? 'link' as const : 'text' as const,
      textContent: text,
      charCount: text.length,
      isPinned: false,
    };
    const latest = { ...(existing || entry), createdAt: timestamp };
    const rest = items.filter((item) => item.id !== latest.id);
    const recentLimit = 50;
    let recent = latest.isPinned ? 0 : 1;
    setItems([latest, ...rest.filter((item) => item.isPinned || recent++ < recentLimit)]);
  },
}));
