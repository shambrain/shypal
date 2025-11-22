import { EventEmitter } from 'eventemitter3';
// Minimal session manager for Phase-1: tracks sessions and emits events.

export type Session = { id: string; peerId: string; established: boolean };

export class SessionManager extends EventEmitter {
  sessions: Map<string, Session> = new Map();

  createSession(id: string, peerId: string) {
    const s: Session = { id, peerId, established: false };
    this.sessions.set(id, s);
    this.emit('sessionCreated', s);
    return s;
  }

  establishSession(id: string) {
    const s = this.sessions.get(id);
    if (s) {
      s.established = true;
      this.emit('sessionEstablished', s);
    }
  }

  getSession(id: string) {
    return this.sessions.get(id);
  }
}

export const sessionManager = new SessionManager();
