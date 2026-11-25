import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Command, Search, Timer, X } from 'lucide-react';
import { copyText } from '../../services/platformService';
import { calculate } from '../../services/calculate';
import { convertText } from '../../services/units';
import { MODULE_REGISTRY } from '../../modules/registry';
import { useTimerStore } from '../../stores/useTimerStore';
import { useIslandStore } from '../../stores/useIslandStore';
import { useNotesStore } from '../../stores/useNotesStore';

interface AiWhisperCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  bottom?: boolean;
}

type CommandResult =
  | { kind: 'module' | 'note' | 'copy'; label: string; value: string }
  | { kind: 'timer'; label: string; seconds: number };

const aliases: Record<string, string> = {
  focus: 'timers', timer: 'timers', clock: 'clock', theme: 'rgb', appearance: 'rgb', bluetooth: 'quick-settings',
};

function findResults(query: string): CommandResult[] {
  const text = query.trim();
  const lower = text.toLowerCase();
  if (!text) return [];
  const timer = lower.match(/^timer\s+(\d+)\s*(min(?:utes?)?|sec(?:onds?)?|[ms])?$/);
  if (timer) {
    const seconds = Number(timer[1]) * (timer[2]?.startsWith('s') ? 1 : 60);
    return seconds > 0 && seconds <= 86400 ? [{ kind: 'timer', label: 'Start timer · ' + seconds + ' s', seconds }] : [];
  }
  if (/^note\s+/i.test(text)) return [{ kind: 'note', label: 'Save to Notes', value: text.replace(/^note\s+/i, '') }];

  const converted = convertText(text);
  if (converted) return [{ kind: 'copy', label: converted, value: converted }];
  const expression = text.replace(/^calc\s+/i, '');
  const number = calculate(expression);
  if (number !== null) {
    const value = number.toLocaleString(undefined, { maximumSignificantDigits: 12 });
    return [{ kind: 'copy', label: expression + ' = ' + value, value }];
  }

  const alias = aliases[lower];
  return MODULE_REGISTRY
    .filter((module) => module.id === alias || module.name.toLowerCase().includes(lower) || module.id.includes(lower))
    .sort((a, b) => Number(b.id === alias || b.id === lower) - Number(a.id === alias || a.id === lower))
    .slice(0, 4)
    .map((module) => ({ kind: 'module', label: module.name, value: module.id }));
}

export function AiWhisperCommandBar({ isOpen, onClose, bottom }: AiWhisperCommandBarProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const results = findResults(query);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelected(0);
    setMessage('');
    window.novaDesktop?.send('focus-island-window');
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const execute = async (result: CommandResult | undefined) => {
    if (!result) return;
    const island = useIslandStore.getState();
    if (result.kind === 'copy') {
      setMessage(await copyText(result.value).catch(() => false) ? 'Copied to clipboard.' : 'Could not copy the result.');
      return;
    }
    if (result.kind === 'module') {
      island.setActiveModule(result.value);
      island.setExpanded(true);
    } else if (result.kind === 'timer') {
      const timer = useTimerStore.getState();
      timer.setMode('pomodoro');
      timer.start(result.seconds);
      island.setActiveModule('timers');
      island.setExpanded(true);
    } else {
      try {
        useNotesStore.getState().add(result.value);
      } catch {
        setMessage('Could not save the note.');
        return;
      }
      island.setActiveModule('notes');
      island.setExpanded(true);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.section
      className="nova-command nova-panel"
      data-bottom={bottom}
      aria-label="Command bar"
      initial={{ opacity: 0, y: bottom ? 5 : -5 }}
      animate={{ opacity: 1, y: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        } else if (event.key === 'Enter' && event.target === input.current) {
          event.preventDefault();
          void execute(results[selected]);
        } else if (results.length > 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
          event.preventDefault();
          setSelected((index) => (index + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length);
        }
      }}
    >
      <div className="nova-command-input">
        <Search size={18} />
        <input ref={input} aria-label="Search tools or run a command" placeholder="Find a tool or run a command…" value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); setMessage(''); }} />
        <button className="nova-icon-button" onClick={onClose} aria-label="Close command bar"><X size={16} /></button>
      </div>
      {results.map((result, index) => (
        <button key={index} className="nova-command-result" data-selected={index === selected} onMouseEnter={() => setSelected(index)} onClick={() => execute(result)}>
          {result.kind === 'timer' ? <Timer size={15} /> : <Command size={15} />}<span>{result.label}</span><ArrowUpRight size={13} />
        </button>
      ))}
      {!query.trim() && <div className="nova-command-examples">
        {['notes', 'timer 25m', '12 km to miles', '48 / 3'].map((value) => <button key={value} onClick={() => { setQuery(value); setSelected(0); input.current?.focus(); }}>{value}</button>)}
      </div>}
      {query.trim() && results.length === 0 && <p>No matching tool or command.</p>}
      {message && <p role="status">{message}</p>}
    </motion.section>
  );
}
