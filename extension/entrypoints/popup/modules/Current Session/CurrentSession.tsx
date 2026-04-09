import { useState } from 'react';
import { CHANNELS, MESSAGE_TYPES } from '@/config/constants';
import { sendMessage } from '@/utils/messaging/message';
import { useStorageItem } from '../../hooks/useStorageItem';
import { sessionIdentity, isSocketConnected, connectedDevices } from '@/utils/storage/storage';
import { IoArrowBack } from 'react-icons/io5';
import { LuCopy, LuCheck, LuKeyRound, LuWifiOff, LuWifi, LuRotateCw, LuTrash2 } from 'react-icons/lu';
import { MdManageAccounts } from 'react-icons/md';
import { RiRemoteControlLine, RiLinkM } from 'react-icons/ri';

/** Truncate UUID for compact display */
const truncateId = (id: string) => {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
};

const CurrentSession = ({ onNavigate }: { onNavigate: (page: string) => void }) => {

  const [session] = useStorageItem(sessionIdentity);
  const [socketConnected] = useStorageItem(isSocketConnected);
  const [devices] = useStorageItem(connectedDevices);
  const [copiedSession, setCopiedSession] = useState(false);

  const isConnected = socketConnected ?? false;
  const remoteCount = devices?.length ?? 0;

  const handleDisconnect = () => {
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.HOST_DISCONNECT } });
  };

  const handleReconnect = () => {
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.HOST_RECONNECT } });
  };

  const handleResetSession = () => {
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.HOST_RESET } });
  };

  const copySessionId = () => {
    if (!session) return;
    navigator.clipboard.writeText(session);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <div className="w-60 bg-sky-950/50 text-white flex flex-col antialiased">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <button onClick={() => onNavigate('HOME')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors cursor-pointer" aria-label="Go back to home" title="Back to home">
          <IoArrowBack className="text-lg" />
        </button>
        <div className="flex items-center gap-1.5">
          <MdManageAccounts className="text-white " />
          <h1 className="font-semibold tracking-wide">Session</h1>
        </div>
        <div className="w-8" aria-hidden="true" />
      </div>

      <div className="mx-3 mb-2 rounded-lg bg-white/5 border border-white/5 p-3">
        <div className="flex items-center gap-2.5">
          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-500/15' : 'bg-red-500/10'}`} aria-hidden="true">
            {isConnected ? <LuWifi className=" text-emerald-400" /> : <LuWifiOff className=" text-red-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className=" font-medium text-white" role="status" aria-label={isConnected ? 'Server connection active' : 'Server disconnected'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-white/30 mt-0.5">
              WebSocket {isConnected ? 'active' : 'closed'}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} aria-hidden="true" />
        </div>
      </div>

      <div className="mx-3 mb-2 rounded-lg bg-white/5 border border-white/5 p-3">
        <p className=" uppercase tracking-widest text-white/30 font-semibold mb-2">Session ID</p>
        {session ? (
          <div className="flex items-center gap-2">
            <span className=" font-mono text-white/70 truncate flex-1" title={session} aria-label={`Session ID: ${session}`}>
              {truncateId(session)}
            </span>
            <button onClick={copySessionId} className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0" aria-label={copiedSession ? 'Session ID copied' : 'Copy session ID to clipboard'} title={copiedSession ? 'Copied!' : 'Copy session ID'}>
              {copiedSession ? <LuCheck className=" text-white/60" /> : <LuCopy className=" text-white/30 hover:text-white/60" />}
            </button>
          </div>
        ) : (
          <p className=" text-white/30 italic">No active session</p>
        )}
      </div>

      {/* Stats row */}
      <div className="mx-3 mb-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-white/5 border border-white/5 p-2.5 flex items-center gap-2">
          <RiRemoteControlLine className=" text-white/30" aria-hidden="true" />
          <div>
            <p className=" font-bold text-white">{remoteCount}</p>
            <p className=" text-white/30">Remotes</p>
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-white/5 border border-white/5 p-2.5 flex items-center gap-2">
          <LuWifi className=" text-white/30" aria-hidden="true" />
          <div>
            <p className=" font-bold text-white">{isConnected ? 'Live' : 'Off'}</p>
            <p className=" text-white/30">Socket</p>
          </div>
        </div>
      </div>

      {/* Session actions */}
      <div className="mx-3 mb-2">
        <p className=" uppercase tracking-widest text-white/30 font-semibold mb-2 px-1">Actions</p>
        <div className="flex flex-col gap-1.5">
          {isConnected ? (
            <button onClick={handleDisconnect} className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-3 hover:bg-white/20 duration-100 flex items-center gap-2" aria-label="Disconnect from the server" title="End the current WebSocket connection">
              <LuWifiOff className=" text-white/60" />
              Disconnect
            </button>
          ) : (
            <button onClick={handleReconnect} className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-3 hover:bg-white/20 duration-100 flex items-center gap-2" aria-label="Reconnect to the server" title="Re-establish WebSocket connection">
              <LuRotateCw className=" text-white/60" />
              Reconnect
            </button>
          )}

          <button onClick={handleResetSession} className="cursor-pointer text-white/60 bg-white/5 rounded-lg w-full py-2 px-3 hover:bg-red-500/15 hover:text-red-400 duration-100 flex items-center gap-2" aria-label="Reset session — clears session identity and disconnects all remotes" title="Clear session and disconnect all paired remotes">
            <LuTrash2 className="" />
            Reset Session
          </button>
        </div>
      </div>

      <div className="mx-3 mb-3">
        <p className=" uppercase tracking-widest text-white/30 font-semibold mb-2 px-1">Quick Access</p>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => onNavigate('PAIRING_CODE')} className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-3 hover:bg-white/20 duration-100 flex items-center gap-2" aria-label="Navigate to pairing key generation" title="Generate a pairing key to connect a new remote">
            <LuKeyRound className="text-sm text-white/60" />
            Pair New Device
          </button>
          <button onClick={() => onNavigate('PAIRED_DEVICES')} className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-3 hover:bg-white/20 duration-100 flex items-center gap-2" aria-label="Navigate to paired devices list" title="View and manage connected remote devices">
            <RiLinkM className="text-sm text-white/60" />
            View Paired Remotes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentSession;