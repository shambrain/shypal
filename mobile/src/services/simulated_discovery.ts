import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

export type Peer = { id: string; name?: string; lastSeen: number };

export class SimulatedDiscovery extends EventEmitter {
  peers: Map<string, Peer> = new Map();
  rotationInterval = 30000; // 30s
  timer?: NodeJS.Timeout;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.rotate(), this.rotationInterval);
    this.rotate();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  rotate() {
    const now = Date.now();
    this.peers.clear();
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const id = uuidv4();
      const p = { id, name: `SimPeer-${id.slice(0,4)}`, lastSeen: now };
      this.peers.set(id, p);
      this.emit('peerFound', p);
    }
    this.emit('rotated', Array.from(this.peers.values()));
  }

  getPeers() {
    return Array.from(this.peers.values());
  }
}

export const simulatedDiscovery = new SimulatedDiscovery();
