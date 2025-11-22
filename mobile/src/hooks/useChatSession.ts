import { useEffect, useState } from 'react';
import { sessionManager } from '../services/session_manager';

export function useChatSession(sessionId: string) {
  const [session, setSession] = useState(sessionManager.getSession(sessionId));
  useEffect(() => {
    function onChange() { setSession(sessionManager.getSession(sessionId)); }
    sessionManager.on('sessionEstablished', onChange);
    return () => { sessionManager.off('sessionEstablished', onChange); };
  }, [sessionId]);
  return { session };
}
