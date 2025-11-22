import { simulatedDiscovery } from '../../mobile/src/services/simulated_discovery';

test('simulated discovery deterministic rotation (seeded)', () => {
  // Force rotate deterministically
  simulatedDiscovery.rotate();
  const updated = simulatedDiscovery.getPeers();
  expect(updated.length).toBeGreaterThanOrEqual(1);
  expect(updated.length).toBeLessThanOrEqual(3);
});
