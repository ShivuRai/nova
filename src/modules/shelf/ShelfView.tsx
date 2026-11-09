import React, { useState } from 'react';
import { FolderArchive, UploadCloud, Trash2, File, FileCode, FileImage, ExternalLink } from 'lucide-react';
import { ShelfItem } from '../../types';

export const ShelfView: React.FC = () => {
  const [shelves, setShelves] = useState<string[]>(['Main Shelf', 'Design Assets', 'Code Snippets']);
  const [activeShelf, setActiveShelf] = useState<string>('Main Shelf');
  const [items, setItems] = useState<ShelfItem[]>([
    {
      id: 'sh-1',
      shelfId: 'Main Shelf',
      fileName: 'Architecture_Diagram_v2.png',
      originalPath: 'C:\\Users\\shivu\\Pictures\\Architecture_Diagram_v2.png',
      managedPath: 'C:\\Users\\shivu\\AppData\\Local\\NOVA\\storage\\shelf\\Architecture_Diagram_v2.png',
      fileSize: 1024 * 780,
      mimeType: 'image/png',
      createdAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: 'sh-2',
      shelfId: 'Main Shelf',
      fileName: 'release_notes_v1.0.md',
      originalPath: 'C:\\Users\\shivu\\Documents\\release_notes_v1.0.md',
      managedPath: 'C:\\Users\\shivu\\AppData\\Local\\NOVA\\storage\\shelf\\release_notes_v1.0.md',
      fileSize: 1024 * 14,
      mimeType: 'text/markdown',
      createdAt: Date.now() - 1000 * 60 * 12,
    },
    {
      id: 'sh-3',
      shelfId: 'Code Snippets',
      fileName: 'island_physics.rs',
      originalPath: 'C:\\Users\\shivu\\dev\\island_physics.rs',
      managedPath: 'C:\\Users\\shivu\\AppData\\Local\\NOVA\\storage\\shelf\\island_physics.rs',
      fileSize: 1024 * 4,
      mimeType: 'text/rust',
      createdAt: Date.now() - 1000 * 60 * 60,
    },
  ]);

  const activeItems = items.filter((it) => it.shelfId === activeShelf);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp')) return FileImage;
    if (name.endsWith('.rs') || name.endsWith('.ts') || name.endsWith('.js')) return FileCode;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleParkDemoFile = () => {
    const demo: ShelfItem = {
      id: `sh-${Date.now()}`,
      shelfId: activeShelf,
      fileName: `capture_${Date.now().toString().slice(-4)}.png`,
      originalPath: 'C:\\Users\\shivu\\Pictures\\capture.png',
      managedPath: 'C:\\Users\\shivu\\AppData\\Local\\NOVA\\storage\\shelf\\capture.png',
      fileSize: 1024 * 420,
      mimeType: 'image/png',
      createdAt: Date.now(),
    };
    setItems([demo, ...items]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearShelf = () => {
    setItems((prev) => prev.filter((it) => it.shelfId !== activeShelf));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Shelf Tab Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {shelves.map((sh) => (
            <button
              key={sh}
              onClick={() => setActiveShelf(sh)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: activeShelf === sh ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: activeShelf === sh ? '#fff' : 'var(--nova-text-secondary)',
                border: '1px solid var(--nova-border)',
              }}
            >
              {sh}
            </button>
          ))}
        </div>

        <button
          onClick={clearShelf}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            color: 'var(--nova-text-muted)',
          }}
          title="Clear current shelf"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Drag & Drop Park Zone */}
      <div
        onClick={handleParkDemoFile}
        style={{
          border: '2px dashed var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          cursor: 'pointer',
        }}
        title="Click to park a mock file or drag files here"
      >
        <UploadCloud size={20} style={{ color: 'var(--nova-blue)' }} />
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)' }}>
          Drop files to park on <span style={{ color: 'var(--nova-text-primary)', fontWeight: 600 }}>{activeShelf}</span> (or click to park demo file)
        </div>
      </div>

      {/* Parked Files List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {activeItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--nova-text-muted)', fontSize: '11px', margin: 'auto' }}>
            No files currently parked on this shelf.
          </div>
        ) : (
          activeItems.map((item) => {
            const Icon = getFileIcon(item.fileName);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: 'rgba(149, 106, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--nova-violet)',
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'var(--nova-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {item.fileName}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
                      {formatSize(item.fileSize)} • Parked {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => alert(`Revealing in Windows Explorer: ${item.managedPath}`)}
                    style={{ padding: 4, color: 'var(--nova-text-secondary)' }}
                    title="Reveal in Explorer"
                  >
                    <ExternalLink size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ padding: 4, color: 'var(--nova-text-muted)' }}
                    title="Remove from shelf"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
