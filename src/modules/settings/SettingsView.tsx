import { useEffect, useState } from 'react';
import { ArrowUpRight, Keyboard, Palette, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useIslandStore } from '../../stores/useIslandStore';
import { useClipboardStore } from '../../stores/useClipboardStore';
import { getAutoStartStatus, isElectron, setAutoStartStatus } from '../../services/platformService';

export function SettingsView() {
  const { settings, updateSettings, resetSettings } = useThemeStore();
  const { setActiveModule, setAiWhisperOpen } = useIslandStore();
  const { captureEnabled, setCaptureEnabled, setItems } = useClipboardStore();
  const [autoStart, setAutoStart] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const desktop = isElectron();

  useEffect(() => {
    let active = true;
    if (desktop) getAutoStartStatus().then((enabled) => { if (active) setAutoStart(enabled); });
    return () => { active = false; };
  }, [desktop]);

  const changeStartup = async (enabled: boolean) => {
    setSaving(true);
    try {
      const actual = await setAutoStartStatus(enabled);
      setAutoStart(actual);
      setStatus(actual === enabled ? 'Windows startup preference saved.' : 'Windows could not update startup.');
    } catch {
      setStatus('Windows could not update startup.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nova-settings">
      <div className="nova-section-heading"><h2>Settings</h2><p role="status">{status}</p></div>
      <div className="nova-settings-grid">
        <section className="nova-panel nova-settings-card">
          <h3><Palette size={16} /> Appearance & behavior</h3>
          <button className="nova-setting-link" onClick={() => setActiveModule('rgb')}>Customization Studio <ArrowUpRight size={14} /></button>
          <label className="nova-setting-row"><span>Automatically tuck away<small>Reduce overlap while you work</small></span><input type="checkbox" checked={settings.enableAutoRetract !== false} onChange={(event) => updateSettings({ enableAutoRetract: event.target.checked })} /></label>
          <label className="nova-setting-row"><span>Follow the active display</span><input type="checkbox" checked={settings.enableMultiMonitorRoaming !== false} onChange={(event) => updateSettings({ enableMultiMonitorRoaming: event.target.checked })} /></label>
          <button className="nova-text-action" onClick={() => { resetSettings(); setStatus('Appearance defaults restored.'); }}>Reset appearance</button>
        </section>
        <section className="nova-panel nova-settings-card">
          <h3><ShieldCheck size={16} /> Windows & privacy</h3>
          <label className="nova-setting-row"><span>Start with Windows</span><input type="checkbox" checked={autoStart === true} disabled={!desktop || autoStart === null || saving} onChange={(event) => changeStartup(event.target.checked)} /></label>
          <label className="nova-setting-row"><span>Keep clipboard history<small>Stores copied text on this PC</small></span><input type="checkbox" checked={captureEnabled} onChange={(event) => setCaptureEnabled(event.target.checked)} /></label>
          <div className="nova-setting-actions">
            <button className="nova-text-action" onClick={() => { setItems([]); setStatus('Clipboard history cleared.'); }}>Clear clipboard history</button>
            <button className="nova-text-action" onClick={() => { localStorage.removeItem('nova_file_shelf_items_v2'); setStatus('File Shelf cleared.'); }}>Clear File Shelf</button>
          </div>
        </section>
      </div>
      <section className="nova-panel nova-settings-card nova-keyboard">
        <h3><Keyboard size={16} /> Keyboard</h3>
        <div className="nova-setting-row"><button className="nova-text-action" onClick={() => setAiWhisperOpen(true)}>Open command bar</button><kbd>Alt + Space</kbd></div>
        <div className="nova-setting-row"><span>Expand or collapse island</span><kbd>Alt + Shift + Space</kbd></div>
      </section>
    </div>
  );
}
