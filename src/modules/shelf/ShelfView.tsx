import React, { useState, useEffect, useRef } from 'react';
import {
  FolderArchive,
  UploadCloud,
  Trash2,
  File,
  FileCode,
  FileImage,
  FileText,
  FileArchive,
  ExternalLink,
  FolderOpen,
  Copy,
  Check,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';
import { runOpenPath, runShowItemInFolder } from '../../services/platformService';

interface ParkedFile {
  id: string;
  shelfId: string;
  name: string;
  path: string;
  size: number;
  addedAt: number;
}

const STORAGE_KEY = 'nova_file_shelf_items_v2';
const SHELVES_KEY = 'nova_file_shelf_categories_v2';

export const ShelfView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shelves, setShelves] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SHELVES_KEY);
      return saved ? JSON.parse(saved) : ['Staging Bay', 'Projects', 'Assets'];
    } catch {
      return ['Staging Bay', 'Projects', 'Assets'];
    }
  });

  const [activeShelf, setActiveShelf] = useState<string>(shelves[0] || 'Staging Bay');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [items, setItems] = useState<ParkedFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SHELVES_KEY, JSON.stringify(shelves));
    } catch (e) {
      console.error(e);
    }
  }, [shelves]);

  const activeItems = items.filter((it) => it.shelfId === activeShelf);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: ParkedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // In Electron, File objects have a 'path' property
      const filePath = (f as any).path || f.name;
      newItems.push({
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        shelfId: activeShelf,
        name: f.name,
        path: filePath,
        size: f.size,
        addedAt: Date.now(),
      });
    }
    setItems((prev) => [...newItems, ...prev]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const openFile = async (filePath: string) => {
    await runOpenPath(filePath);
  };

  const revealFile = async (filePath: string) => {
    await runShowItemInFolder(filePath);
  };

  const copyPath = (id: string, filePath: string) => {
    navigator.clipboard.writeText(filePath);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCurrentShelf = () => {
    setItems((prev) => prev.filter((it) => it.shelfId !== activeShelf));
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext || '')) return FileImage;
    if (['js', 'ts', 'tsx', 'rs', 'py', 'json', 'html', 'css'].includes(ext || '')) return FileCode;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return FileArchive;
    if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext || '')) return FileText;
    return File;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320, position: 'relative' }}>
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Header with Prominent Hoverable Help Tooltip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderArchive size={14} style={{ color: 'var(--nova-blue)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)' }}>
            FILE SHELF • TEMPORARY STAGING BAY
          </span>

          {/* Question mark with hover explanation */}
          <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
          >
            <HelpCircle
              size={13}
              style={{
                color: showHelp ? 'var(--nova-blue)' : 'var(--nova-text-muted)',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            />
            {showHelp && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: -10,
                  width: 280,
                  backgroundColor: 'rgba(15, 17, 26, 0.96)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  zIndex: 100,
                  backdropFilter: 'blur(16px)',
                  fontSize: '11px',
                  color: 'var(--nova-text-primary)',
                  lineHeight: '1.45',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--nova-blue)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>💡 What is File Shelf?</span>
                </div>
                <div>
                  Instead of saving temporary downloads, screenshots, or project attachments to your desktop where they create clutter, park them here!
                </div>
                <div style={{ marginTop: 6, color: 'var(--nova-text-secondary)', fontSize: '10px' }}>
                  • Drag & drop any files or click "+ Park Files"<br />
                  • Open them with one click<br />
                  • Reveal them in Windows File Explorer<br />
                  • One-click copy full file paths
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear Current Shelf */}
        {activeItems.length > 0 && (
          <button
            onClick={clearCurrentShelf}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              color: 'var(--nova-text-muted)',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
            title="Clear all files in this shelf"
          >
            <Trash2 size={11} />
            <span>Clear Shelf</span>
          </button>
        )}
      </div>

      {/* Shelf Category Tabs & Add Files Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
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
                cursor: 'pointer',
                fontWeight: activeShelf === sh ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {sh} ({items.filter((it) => it.shelfId === sh).length})
            </button>
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: 'var(--nova-radius-pill)',
            color: 'var(--nova-cyan)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={12} />
          <span>Park Files</span>
        </button>
      </div>

      {/* Drag & Drop Park Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '1.5px dashed var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: activeItems.length === 0 ? '22px 14px' : '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          flexDirection: activeItems.length === 0 ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <UploadCloud size={activeItems.length === 0 ? 24 : 16} style={{ color: 'var(--nova-blue)' }} />
        <div style={{ textAlign: activeItems.length === 0 ? 'center' : 'left' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
            Drag & drop files here, or click to browse
          </span>
          {activeItems.length === 0 && (
            <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
              Keep your desktop clean • Files stay accessible anytime
            </div>
          )}
        </div>
      </div>

      {/* Parked Files List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
        {activeItems.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: 'var(--nova-text-muted)',
              fontSize: '11px',
              fontStyle: 'italic',
            }}
          >
            No files parked in "{activeShelf}" yet. Drop a file above to stage it!
          </div>
        ) : (
          activeItems.map((item) => {
            const Icon = getFileIcon(item.name);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  <Icon size={16} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--nova-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 240,
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
                      {formatSize(item.size)} • {new Date(item.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => openFile(item.path)}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--nova-border)',
                      borderRadius: 4,
                      color: 'var(--nova-text-primary)',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      cursor: 'pointer',
                    }}
                    title="Open file"
                  >
                    <ExternalLink size={10} />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => revealFile(item.path)}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--nova-border)',
                      borderRadius: 4,
                      color: 'var(--nova-text-primary)',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      cursor: 'pointer',
                    }}
                    title="Reveal in File Explorer"
                  >
                    <FolderOpen size={10} />
                  </button>

                  <button
                    onClick={() => copyPath(item.id, item.path)}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--nova-border)',
                      borderRadius: 4,
                      color: copiedId === item.id ? 'var(--nova-success)' : 'var(--nova-text-primary)',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      cursor: 'pointer',
                    }}
                    title="Copy full path"
                  >
                    {copiedId === item.id ? <Check size={10} /> : <Copy size={10} />}
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--nova-border)',
                      borderRadius: 4,
                      color: 'var(--nova-danger)',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                    title="Remove from shelf"
                  >
                    <Trash2 size={10} />
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
