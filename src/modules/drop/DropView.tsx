import React, { useEffect, useState } from 'react';
import { Copy, FileCheck, FolderOpen, QrCode } from 'lucide-react';
import { copyText, getIpc } from '../../services/platformService';

interface DroppedFile {
  name: string;
  size: string;
  timestamp: number;
}

type DropSession = { active: false } | { active: true; url: string; qrImage: string };

export const DropView: React.FC = () => {
  const ipc = getIpc();
  const [session, setSession] = useState<DropSession>({ active: false });
  const [files, setFiles] = useState<DroppedFile[]>([]);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!ipc) return;
    let active = true;
    const refreshFiles = () => ipc.invoke('get-dropped-files').then((list) => {
      if (active) setFiles(list);
    }).catch(() => {});
    const stopFiles = ipc.on('drop-file-received', refreshFiles);
    const stopSession = ipc.on('drop-session-changed', (_event, next) => {
      setSession(next);
      setFeedback('');
    });
    ipc.invoke('get-drop-info').then((next) => { if (active) setSession(next); }).catch(() => {});
    void refreshFiles();
    return () => { active = false; stopFiles(); stopSession(); };
  }, [ipc]);

  const toggleReceiving = async () => {
    if (!ipc) return;
    setPending(true);
    setFeedback('');
    try {
      setSession(await ipc.invoke(session.active ? 'stop-drop' : 'start-drop'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message.replace(/^.*Error: /, '') : 'NOVA Drop could not start.');
    } finally {
      setPending(false);
    }
  };

  const copyLink = async () => {
    if (!session.active) return;
    setFeedback(await copyText(session.url).catch(() => false) ? 'Pairing link copied.' : 'Could not copy pairing link.');
  };

  const openFolder = async () => {
    const result = await ipc?.invoke('open-drop-folder').catch(() => null);
    if (!result?.success) setFeedback('Could not open the downloads folder.');
  };

  return (
    <div className="nova-drop-layout">
      <section className="nova-drop-pairing nova-panel">
        {session.active ? (
          <img src={session.qrImage} width="120" height="120" alt="Scan to pair your phone with NOVA Drop" />
        ) : (
          <div className="nova-drop-icon"><QrCode size={30} /></div>
        )}
        <strong>{session.active ? 'Scan with your phone' : 'Receive from your phone'}</strong>
        <p>{session.active ? 'Same network. This link expires in 10 minutes.' : 'Use the same Wi-Fi or local network.'}</p>
        <button className="nova-action" disabled={!ipc || pending} onClick={toggleReceiving}>
          {pending ? 'Please wait…' : session.active ? 'Stop receiving' : 'Start receiving'}
        </button>
        {session.active && <button className="nova-text-action" onClick={copyLink}><Copy size={13} /> Copy pairing link</button>}
      </section>
      <section className="nova-drop-files nova-panel">
        <div className="nova-section-heading">
          <strong>Received files</strong>
          <button className="nova-text-action" disabled={!ipc} onClick={openFolder}><FolderOpen size={15} /> Open folder</button>
        </div>
        {feedback && <p role="status">{feedback}</p>}
        {!ipc && <p>Open the Windows app to receive files.</p>}
        {files.length === 0 && <p>No files received yet.</p>}
        {files.map((file) => (
          <div className="nova-file-row" key={file.name}>
            <FileCheck size={15} /><span title={file.name}>{file.name}</span><small>{file.size}</small>
          </div>
        ))}
      </section>
    </div>
  );
};
