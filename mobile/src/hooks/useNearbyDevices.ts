import { useEffect, useState } from 'react';
import { simulatedDiscovery } from '../services/simulated_discovery';

export function useNearbyDevices() {
  const [peers, setPeers] = useState<any[]>([]);

  useEffect(() => {
    function onRotated(list: any[]) { setPeers(list); }
    simulatedDiscovery.on('rotated', onRotated);
    simulatedDiscovery.start();
    return () => { simulatedDiscovery.stop(); simulatedDiscovery.off('rotated', onRotated); };
  }, []);

  return { peers };
}
