import { MessageTtlEngine } from '../../mobile/src/services/message_ttl';

test('message TTL GC removes expired messages', () => {
  const engine = new MessageTtlEngine(1); // 1 second TTL
  const now = Date.now();
  engine.add({ id: 'm1', from: 'a', to: 'b', body: 'x', ts: now - 2000 });
  engine.add({ id: 'm2', from: 'a', to: 'b', body: 'y', ts: now });
  const all = engine.getAll();
  expect(all.find(m => m.id === 'm1')).toBeUndefined();
  expect(all.find(m => m.id === 'm2')).toBeDefined();
});
