import { CHANNELS, MESSAGE_TYPES } from '@/config/constants';
import { sendMessage } from '@/utils/messaging/message';
import { useStorageItem } from '../../hooks/useStorageItem';
import { sessionIdentity } from '@/utils/storage/storage';

const CurrentSession = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  
  const [session] = useStorageItem(sessionIdentity);

  const handleDisconnect = () => {
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.HOST_DISCONNECT } });
  };

  const handleReconnect = () => {
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.HOST_RECONNECT } });
  };

  return (
    <>
      <button onClick={() => onNavigate('HOME')}>Back</button>
      {/* Session ID */}
      <p>Session ID: {session}</p>
      <button onClick={() => handleDisconnect()}>Disconnect Session</button>
      <button onClick={() => handleReconnect()}>Reconnect Session</button>
      {/* Create QR Code */}
      <button onClick={() => onNavigate('PAIRING_CODE')}>PAIR NEW DEVICE</button>
      {/* View Paired Devices - SHOW PAIRED DEIVICES SCREEN*/}
      <button onClick={() => onNavigate('PAIRED_DEVICES')}>VIEW PAIRED DEVICES</button>
    </>
  )
}

export default CurrentSession