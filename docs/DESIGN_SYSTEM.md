# NOVA Design System & Visual Tokens

**Document ID:** NOVA-UI-001  
**Aesthetic:** Hybrid Premium Minimal + Gaming RGB  
**Default Mode:** Premium Minimal (Deep Onyx / Slate Glass)  

---

## 1. Color Palette Tokens

All colors are strictly tokenized using CSS variables defined at `:root`:

```css
:root {
  /* Surfaces */
  --nova-background: #0B0D12;
  --nova-surface: #141720;
  --nova-surface-elevated: #1C2130;
  --nova-surface-glass: rgba(20, 23, 32, 0.78);
  --nova-pill-bg: rgba(11, 13, 18, 0.92);

  /* Typography */
  --nova-text-primary: #F5F6FA;
  --nova-text-secondary: #9BA3B4;
  --nova-text-muted: #626A7A;

  /* Accent Brand Colors */
  --nova-blue: #6688FF;
  --nova-violet: #956AFF;
  --nova-cyan: #54D7E8;

  /* Semantic Feedback */
  --nova-success: #49C98A;
  --nova-warning: #F3B95B;
  --nova-danger: #F16C78;

  /* Borders & Shadows */
  --nova-border: rgba(255, 255, 255, 0.08);
  --nova-border-focus: rgba(102, 136, 255, 0.4);
  --nova-shadow-pill: 0 8px 32px rgba(0, 0, 0, 0.48), 0 0 1px rgba(255, 255, 255, 0.12);
  --nova-shadow-card: 0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08);

  /* RGB / Glow Animation */
  --nova-rgb-gradient: linear-gradient(135deg, #6688FF, #956AFF, #54D7E8, #49C98A);
  --nova-glow-rgb: 0 0 18px rgba(102, 136, 255, 0.35);

  /* Radii */
  --nova-radius-pill: 9999px;
  --nova-radius-card: 20px;
  --nova-radius-widget: 14px;
  --nova-radius-button: 10px;
  --nova-radius-input: 8px;
}
```

---

## 2. Dynamic Island Metrics & Physics

### Pill & Workspace Dimensions
- **Pill (Collapsed):**
  - Resting Width: `180px` (or `220px` when active media/timer indicator is present)
  - Resting Height: `32px`
  - Border Radius: `9999px`
- **Expanded Workspace:**
  - Expanded Width: `640px` (adaptive: `520px` to `760px` based on screen DPI)
  - Expanded Height: `440px` (adaptive: `360px` to `500px`)
  - Border Radius: `24px`

### Spring Motion Curves
NOVA uses high-performance spring interpolation via Framer Motion:
- **Expansion Spring:** `stiffness: 380, damping: 30, mass: 0.8`
- **Collapse Transition:** `duration: 0.22s, ease: [0.16, 1, 0.3, 1]`
- **Content Stagger:** Child cards enter with `staggerChildren: 0.04s` and `y: 8 -> 0`.
