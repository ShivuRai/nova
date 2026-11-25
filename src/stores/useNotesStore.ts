import { create } from 'zustand';
import { NoteItem } from '../types';

const KEY = 'nova_notes';

function loadNotes(): NoteItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(saved)) return saved.filter((note) => typeof note?.id === 'string');
    const scratch = JSON.parse(localStorage.getItem('nova_scratch_notes') || '[]');
    if (!Array.isArray(scratch)) return [];
    return scratch.filter((note) => typeof note?.text === 'string').map((note) => ({
      id: 'scratch-' + note.id,
      title: note.text.split('\n')[0].slice(0, 42) || 'Quick note',
      content: note.text,
      isPinned: false,
      createdAt: Number(note.id) || Date.now(),
      updatedAt: Number(note.id) || Date.now(),
    }));
  } catch {
    return [];
  }
}

interface NotesState {
  notes: NoteItem[];
  save: (update: (notes: NoteItem[]) => NoteItem[]) => void;
  add: (content?: string) => string;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: loadNotes(),
  save: (update) => {
    const notes = update(get().notes);
    localStorage.setItem(KEY, JSON.stringify(notes));
    set({ notes });
  },
  add: (content = '') => {
    const id = 'note-' + crypto.randomUUID();
    const now = Date.now();
    const title = content.split('\n')[0].slice(0, 42) || 'New note';
    get().save((notes) => [{ id, title, content, isPinned: false, createdAt: now, updatedAt: now, checklists: [] }, ...notes]);
    return id;
  },
}));
