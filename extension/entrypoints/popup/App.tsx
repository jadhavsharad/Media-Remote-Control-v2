import { PairedDevices, Home, CurrentSession } from "./modules/exports";
import { useState } from "react";
import QRCode from "./modules/QR Code/QRCode";


const App = () => {
  const [currentModule, setCurrentModule] = useState<string>('HOME');

  const renderPage = () => {
    switch (currentModule) {
      case 'PAIRING_CODE':
        return <QRCode onNavigate={setCurrentModule} />
      case 'PAIRED_DEVICES':
        return <PairedDevices onNavigate={setCurrentModule} />
      case 'CURRENT_SESSION':
        return <CurrentSession onNavigate={setCurrentModule} />
      default:
        return <Home onNavigate={setCurrentModule} />;
    }
  }

  return (
    <>
      {renderPage()}
    </>
  )
}

export default App