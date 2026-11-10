import React, { useState } from 'react';
import { Search, Globe, Plus, Trash2, ExternalLink, Star, Copy, Check } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: string;
  isFavorite: boolean;
  createdAt: number;
}

export const LinksView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load user saved links from localStorage (no hardcoded demo bookmarks)
  const [links, setLinks] = useState<SavedLink[]>(() => {
    try {
      const saved = localStorage.getItem('nova_saved_links');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['All', 'General', 'Work', 'Dev', 'Media'];

  const saveLinks = (updated: SavedLink[]) => {
    setLinks(updated);
    try {
      localStorage.setItem('nova_saved_links', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredLinks = links.filter((l) => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesQuery =
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.url.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let defaultTitle = newTitle.trim();
    if (!defaultTitle) {
      try {
        const u = new URL(formattedUrl);
        defaultTitle = u.hostname.replace(/^www\./, '');
      } catch (e) {
        defaultTitle = formattedUrl;
      }
    }

    const newEntry: SavedLink = {
      id: `link-${Date.now()}`,
      title: defaultTitle,
      url: formattedUrl,
      category: newCategory || 'General',
      isFavorite: false,
      createdAt: Date.now(),
    };

    const updated = [newEntry, ...links];
    saveLinks(updated);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = links.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l));
    saveLinks(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = links.filter((l) => l.id !== id);
    saveLinks(updated);
  };

  const openUrl = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { shell } = (window as any).require('electron');
        shell.openExternal(url);
        return;
      } catch (e) {}
    }
    window.open(url, '_blank');
  };

  const copyUrl = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
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
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            backgroundColor: isAdding ? 'rgba(255,255,255,0.1)' : 'var(--nova-blue)',
            border: 'none',
            borderRadius: 'var(--nova-radius-input)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={13} />
          <span>{isAdding ? 'Cancel' : 'Add Link'}</span>
        </button>
      </div>

      {/* Inline Add Link Drawer */}
      {isAdding && (
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="URL (e.g. google.com or https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              style={{
                flex: 1.5,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-input)',
                padding: '6px 10px',
                color: 'var(--nova-text-primary)',
                fontSize: '11px',
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-input)',
                padding: '6px 10px',
                color: 'var(--nova-text-primary)',
                fontSize: '11px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['General', 'Work', 'Dev', 'Media'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '10px',
                    backgroundColor: newCategory === cat ? 'var(--nova-blue)' : 'transparent',
                    color: newCategory === cat ? '#fff' : 'var(--nova-text-muted)',
                    border: '1px solid var(--nova-border)',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleAdd}
              disabled={!newUrl.trim()}
              style={{
                padding: '5px 14px',
                backgroundColor: newUrl.trim() ? 'var(--nova-blue)' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--nova-radius-input)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: newUrl.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Save Bookmark
            </button>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--nova-radius-pill)',
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: activeCategory === cat ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: activeCategory === cat ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Links List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 250,
          paddingRight: 4,
        }}
      >
        {filteredLinks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '36px 16px',
              color: 'var(--nova-text-muted)',
              textAlign: 'center',
            }}
          >
            <Globe size={28} style={{ color: 'var(--nova-blue)', opacity: 0.7 }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              {query ? 'No matching bookmarks found' : 'No Saved Links Yet'}
            </div>
            <div style={{ fontSize: '11px', maxWidth: 260, lineHeight: 1.4 }}>
              {query
                ? 'Try a different search query or change category.'
                : 'Click "+ Add Link" above to save your favorite websites and quick shortcuts!'}
            </div>
          </div>
        ) : (
          filteredLinks.map((link) => {
            const isCopied = copiedId === link.id;
            return (
              <div
                key={link.id}
                onClick={() => openUrl(link.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--nova-cyan)', display: 'flex', alignItems: 'center' }}>
                    <Globe size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--nova-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {link.title}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--nova-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: 1,
                      }}
                    >
                      {link.url}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--nova-text-muted)',
                      marginRight: 4,
                    }}
                  >
                    {link.category}
                  </span>

                  <button
                    onClick={(e) => copyUrl(link.id, link.url, e)}
                    title="Copy URL"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: isCopied ? 'var(--nova-cyan)' : 'var(--nova-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {isCopied ? <Check size={13} style={{ color: 'var(--nova-cyan)' }} /> : <Copy size={13} />}
                  </button>

                  <button
                    onClick={(e) => toggleFavorite(link.id, e)}
                    title={link.isFavorite ? 'Unfavorite' : 'Favorite'}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: link.isFavorite ? '#FBBF24' : 'var(--nova-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <Star size={13} fill={link.isFavorite ? '#FBBF24' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(link.id, e)}
                    title="Delete link"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: 'var(--nova-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <ExternalLink size={13} style={{ color: 'var(--nova-text-secondary)', marginLeft: 2 }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default LinksView;
