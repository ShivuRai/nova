import { useState } from 'react';
import { Bluetooth, Calculator, Lock, Monitor, Moon, Scissors, Settings, Sun, Volume2, Wifi, Activity, VolumeX } from 'lucide-react';
import { isElectron, runQuickAction } from '../../services/platformService';

const connections = [
  { id: 'open-wifi', name: 'Wi-Fi', detail: 'Choose a network', icon: Wifi, color: 'lavender' },
  { id: 'open-bluetooth', name: 'Bluetooth', detail: 'Pair or manage devices', icon: Bluetooth, color: 'mint' },
  { id: 'open-nightlight', name: 'Night light', detail: 'Open Windows settings', icon: Moon, color: 'peach' },
];

const shortcuts = [
  { id: 'open-snipping-tool', name: 'Screenshot', icon: Scissors },
  { id: 'open-task-manager', name: 'Task Manager', icon: Activity },
  { id: 'open-calc', name: 'Calculator', icon: Calculator },
  { id: 'open-display-settings', name: 'Display', icon: Monitor },
  { id: 'open-windows-settings', name: 'Windows', icon: Settings },
  { id: 'lock-workstation', name: 'Lock PC', icon: Lock },
];

export function QuickSettingsView() {
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const desktop = isElectron();

  const run = async (action: string, label: string) => {
    setPending(true);
    setFeedback(null);
    try {
      const result = await runQuickAction(action);
      setFeedback({ success: result.success, text: result.success ? result.message || label : result.error || 'Windows could not complete this action.' });
    } catch {
      setFeedback({ success: false, text: 'Windows could not complete this action.' });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="nova-settings nova-quick-settings">
      <div className="nova-section-heading"><h2>Quick Settings</h2><p role="status" data-error={feedback?.success === false}>{feedback?.text || (!desktop ? 'Available in the Windows app' : '')}</p></div>
      <div className="nova-connection-grid">
        {connections.map(({ id, name, detail, icon: Icon, color }) => (
          <button className="nova-panel nova-connection" key={id} disabled={!desktop || pending} onClick={() => run(id, `Opened ${name}`)}>
            <span className={'nova-tool-icon ' + color}><Icon size={16} /></span><span><strong>{name}</strong><small>{detail}</small></span>
          </button>
        ))}
      </div>
      <div className="nova-control-grid">
        <section className="nova-panel nova-control">
          <div className="nova-section-heading"><h3><Volume2 size={15} /> Volume</h3><button className="nova-text-action" disabled={!desktop || pending} onClick={() => run('open-sound-settings', 'Opened Sound settings')}>Sound settings</button></div>
          <div className="nova-control-actions">
            <button disabled={!desktop || pending} onClick={() => run('volume-down', 'Volume decreased')}>Lower</button>
            <button disabled={!desktop || pending} onClick={() => run('volume-mute', 'Mute toggled')}><VolumeX size={14} /> Mute</button>
            <button disabled={!desktop || pending} onClick={() => run('volume-up', 'Volume increased')}>Raise</button>
          </div>
        </section>
        <section className="nova-panel nova-control">
          <div className="nova-section-heading"><h3><Sun size={15} /> Brightness</h3></div>
          <div className="nova-control-actions">
            <button disabled={!desktop || pending} onClick={() => run('brightness-down', 'Brightness decreased')}>Dim</button>
            <button disabled={!desktop || pending} onClick={() => run('brightness-up', 'Brightness increased')}>Brighten</button>
          </div>
        </section>
      </div>
      <div className="nova-shortcuts" aria-label="Windows tools">
        {shortcuts.map(({ id, name, icon: Icon }) => (
          <button className="nova-panel" key={id} disabled={!desktop || pending} onClick={() => run(id, name + ' opened')}><Icon size={14} /> {name}</button>
        ))}
      </div>
    </div>
  );
}
