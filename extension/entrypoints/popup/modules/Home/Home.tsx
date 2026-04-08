

const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div>
      <button onClick={() => onNavigate('PAIRING_CODE')}>Pairing Code</button>
      <button onClick={() => onNavigate('PAIRED_DEVICES')}>Paired Devices</button>
      <button onClick={() => onNavigate('CURRENT_SESSION')}>Current Session</button>
    </div>
  )
}

export default Home