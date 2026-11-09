import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, Pin } from 'lucide-react';
import { NoteItem } from '../../types';
import { useIslandStore } from '../../stores/useIslandStore';

export const NotesView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'Sprint Objectives',
      content: 'Complete Phase 1 foundation for NOVA desktop bar.',
      isPinned: true,
      checklists: [
        { id: 'c1', text: 'Top-centre transparent island window', done: true },
        { id: 'c2', text: 'Hover expansion and interaction lock', done: true },
        { id: 'c3', text: 'SQLite persistent schema integration', done: false },
      ],
      createdAt: Date.now() - 1000 * 60 * 60,
      updatedAt: Date.now(),
    },
    {
      id: 'note-2',
      title: 'Design Decisions',
      content: 'Use Inter for interface typography and JetBrains Mono for system vitals.',
      isPinned: false,
      createdAt: Date.now() - 1000 * 60 * 120,
      updatedAt: Date.now(),
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleAddNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '',
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      checklists: [],
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId ? { ...n, [field]: value, updatedAt: Date.now() } : n
      )
    );
  };

  const toggleChecklist = (checkId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNoteId || !n.checklists) return n;
        return {
          ...n,
          checklists: n.checklists.map((c) =>
            c.id === checkId ? { ...c, done: !c.done } : c
          ),
        };
      })
    );
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id && remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 12, height: 320 }}>
      {/* Left List of Notes */}
      <div
        style={{
          borderRight: '1px solid var(--nova-border)',
          paddingRight: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
        }}
      >
        <button
          onClick={handleAddNote}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '6px 10px',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <Plus size={13} />
          <span>New Note</span>
        </button>

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNoteId(note.id)}
            style={{
              padding: '6px 8px',
              borderRadius: 'var(--nova-radius-input)',
              backgroundColor:
                note.id === selectedNoteId
                  ? 'rgba(102, 136, 255, 0.15)'
                  : 'var(--nova-surface)',
              border:
                note.id === selectedNoteId
                  ? '1px solid rgba(102, 136, 255, 0.4)'
                  : '1px solid var(--nova-border)',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: 'var(--nova-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {note.title || 'Untitled'}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--nova-text-muted)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {note.content || 'No text'}
            </div>
          </div>
        ))}
      </div>

      {/* Right Note Editor */}
      {selectedNote ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) => handleUpdateNote('title', e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              placeholder="Note title..."
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--nova-text-primary)',
                width: '100%',
              }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => handleDeleteNote(selectedNote.id)}
                style={{ color: 'var(--nova-text-muted)', padding: 4 }}
                title="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <textarea
            value={selectedNote.content}
            onChange={(e) => handleUpdateNote('content', e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            placeholder="Type your notes here..."
            style={{
              flex: 1,
              background: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              padding: 8,
              fontSize: '12px',
              color: 'var(--nova-text-primary)',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Checklists */}
          {selectedNote.checklists && selectedNote.checklists.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)' }}>
                Checklist
              </div>
              {selectedNote.checklists.map((chk) => (
                <div
                  key={chk.id}
                  onClick={() => toggleChecklist(chk.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: chk.done ? 'var(--nova-text-muted)' : 'var(--nova-text-primary)',
                    textDecoration: chk.done ? 'line-through' : 'none',
                  }}
                >
                  {chk.done ? (
                    <CheckSquare size={13} style={{ color: 'var(--nova-success)' }} />
                  ) : (
                    <Square size={13} style={{ color: 'var(--nova-text-muted)' }} />
                  )}
                  <span>{chk.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: 'var(--nova-text-muted)', fontSize: '12px', margin: 'auto' }}>
          Select or create a note.
        </div>
      )}
    </div>
  );
};
