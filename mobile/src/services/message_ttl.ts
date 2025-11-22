export type Message = { id: string; from: string; to: string; body: string; ts: number };

export class MessageTtlEngine {
  ttlMs: number;
  messages: Map<string, Message> = new Map();

  constructor(ttlSeconds = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  add(msg: Message) {
    this.messages.set(msg.id, msg);
  }

  gc(now = Date.now()) {
    for (const [id, msg] of this.messages.entries()) {
      if (now - msg.ts > this.ttlMs) this.messages.delete(id);
    }
  }

  getAll(now = Date.now()) {
    this.gc(now);
    return Array.from(this.messages.values());
  }
}
