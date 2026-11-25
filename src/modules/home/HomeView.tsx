import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useTimerStore } from '../../stores/useTimerStore';
import {
  Activity, ArrowUpRight, ClipboardCopy, CloudSun, Command, FileText, FolderArchive,
  Music2, Pause, Play, QrCode, SkipBack, SkipForward, Sparkles, Timer,
} from 'lucide-react';

const tools = [
  { id: 'clipboard', label: 'Clipboard', icon: ClipboardCopy, color: 'lavender' },
  { id: 'notes', label: 'Notes', icon: FileText, color: 'peach' },
  { id: 'timers', label: 'Focus', icon: Timer, color: 'mint' },
  { id: 'drop', label: 'Drop', icon: QrCode, color: 'lavender' },
  { id: 'shelf', label: 'File Shelf', icon: FolderArchive, color: 'peach' },
  { id: 'weather', label: 'Weather', icon: CloudSun, color: 'mint' },
];

export function HomeView() {
  const { setActiveModule, setAiWhisperOpen } = useIslandStore();
  const { metrics, media, hasMetrics } = useSystemStore();
  const { mode, isRunning, secondsRemaining } = useTimerStore();
  const running = isRunning && mode !== 'stopwatch';
  const timer = Math.floor(secondsRemaining / 60) + ':' + String(secondsRemaining % 60).padStart(2, '0');
  const mediaAction = (action: 'prev' | 'toggle' | 'next') => window.novaDesktop?.send('control-media', action);

  return (
    <div className="nova-home">
      <button className="nova-hero" onClick={() => setAiWhisperOpen(true)}>
        <span className="nova-hero-icon"><Sparkles size={21} /></span>
        <span className="nova-hero-copy"><strong>Find a tool or run a command</strong><small>Search tools, calculate, start a timer, or save a note</small></span>
        <kbd>Alt + Space</kbd>
      </button>

      <div className="nova-section-heading"><h2>Quick access</h2><button className="nova-text-action" onClick={() => setActiveModule('launcher')}><Command size={13} /> App launcher</button></div>
      <div className="nova-tool-grid">
        {tools.map(({ id, label, icon: Icon, color }) => (
          <button className="nova-tool nova-panel" key={id} onClick={() => setActiveModule(id)}>
            <span className={'nova-tool-icon ' + color}><Icon size={17} /></span>
            <span>{label}</span>
            {id === 'timers' && running && <small>{timer}</small>}
          </button>
        ))}
      </div>

      <div className="nova-home-widgets">
        <section className="nova-panel nova-widget">
          <span className="nova-tool-icon peach"><Music2 size={16} /></span>
          <div className="nova-widget-copy"><strong title={media.title}>{media.title || 'Media'}</strong><small>{media.artist || (media.title ? 'Windows playback' : 'Nothing playing')}</small></div>
          {media.title && <div className="nova-media-controls">
            <button className="nova-icon-button" aria-label="Previous track" onClick={() => mediaAction('prev')}><SkipBack size={14} /></button>
            <button className="nova-icon-button" aria-label={media.isPlaying ? 'Pause' : 'Play'} onClick={() => mediaAction('toggle')}>{media.isPlaying ? <Pause size={15} /> : <Play size={15} />}</button>
            <button className="nova-icon-button" aria-label="Next track" onClick={() => mediaAction('next')}><SkipForward size={14} /></button>
          </div>}
        </section>
        <button className="nova-panel nova-widget nova-tool" onClick={() => setActiveModule('system')}>
          <span className="nova-tool-icon mint"><Activity size={16} /></span>
          <span className="nova-widget-copy"><strong>System</strong><small>{hasMetrics ? `CPU ${metrics.cpuUsagePercent}% · RAM ${metrics.ramUsagePercent}%` : 'Waiting for Windows metrics'}</small></span>
          <ArrowUpRight size={14} className="nova-widget-arrow" />
        </button>
      </div>
    </div>
  );
}
