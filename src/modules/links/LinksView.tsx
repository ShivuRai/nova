import React, { useState } from 'react';
import { Search, Globe, Plus, Trash2, ExternalLink, Star } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: string;
  isFavorite: boolean;
}

export const LinksView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [links, setLinks] = useState<SavedLink[]>([
    { id: '1', title: 'GitHub', url: 'https://github.com', category: 'Dev', isFavorite: true },
    { id: '2', title: 'Rust Documentation', url: 'https://doc.rust-lang.org', category: 'Dev', isFavorite: true },
    { id: '3', title: 'Tauri 2 Guides', url: 'https://v2.tauri.app', category: 'Dev', isFavorite: false },
    { id: '4', title: 'Open-Meteo Weather API', url: 'https://open-meteo.com', category: 'Productivity', isFavorite: false },
    { id: '5', title: 'YouTube Music', url: 'https://music.youtube.com', category: 'Media', isFavorite: true },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['All', 'Dev', 'Productivity', 'Media'];

  const filteredLinks = links.filter((l) => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesQuery =
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.url.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const newEntry: SavedLink = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      category: activeCategory === 'All' ? 'General' : activeCategory,
      isFavorite: false,
    };
    setLinks([newEntry, ...links]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const toggleFavorite = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Top Search & Add Trigger */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            padding: '6px 10px',
          }}
        >
          <Search size={14} style={{ color: 'var(--nova-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--nova-text-primary)',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 8,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
          }}
        >
          <input
            placeholder="Title (e.g. GitHub)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '11px',
              color: 'var(--nova-text-primary)',
            }}
          />
          <input
            placeholder="URL (e.g. https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              flex: 1.5,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '11px',
              color: 'var(--nova-text-primary)',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--nova-blue)',
              color: '#fff',
              borderRadius: 4,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: activeCategory === cat ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: activeCategory === cat ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Links List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {filteredLinks.map((item) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: 'rgba(102, 136, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nova-blue)',
                }}
              >
                <Globe size={14} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, color: 'var(--nova-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {item.url}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => toggleFavorite(item.id)}
                style={{ padding: 4, color: item.isFavorite ? 'var(--nova-warning)' : 'var(--nova-text-muted)' }}
              >
                <Star size={13} />
              </button>
              <button
                onClick={() => openUrl(item.url)}
                style={{ padding: 4, color: 'var(--nova-text-secondary)' }}
                title="Open in browser"
              >
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ padding: 4, color: 'var(--nova-text-muted)' }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
