import { connectedDevices } from "@/utils/storage/storage"
import { useStorageItem } from "../../hooks/useStorageItem"


const PairedDevices = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [devices] = useStorageItem(connectedDevices);

  return (
    <div>
      {
        devices?.map((device) => (
          <div key={device.id}>
            {device.id}
          </div>
        ))
      }
      <button onClick={() => onNavigate('HOME')}>Back</button>
    </div>
  )
}

export default PairedDevices