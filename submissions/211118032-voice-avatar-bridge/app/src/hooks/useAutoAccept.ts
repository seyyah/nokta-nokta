import { useEffect, useRef, useCallback } from 'react';
import { EscalationService } from '../services/escalationService';

type OnAccepted = (escalationId: string) => void;

/**
 * Polls AsyncStorage every 2 seconds and auto-accepts any pending escalations
 * after a ~3-second delay. Calls onAccepted when an escalation transitions
 * from pending → accepted.
 */
export function useAutoAccept(onAccepted?: OnAccepted) {
  const pendingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const mountedRef = useRef(true);

  const scheduleAccept = useCallback(
    (id: string) => {
      if (pendingTimers.current.has(id)) return;

      const timer = setTimeout(async () => {
        if (!mountedRef.current) return;
        const updated = await EscalationService.acceptPendingEscalation(id);
        pendingTimers.current.delete(id);
        if (updated && onAccepted) {
          onAccepted(id);
        }
      }, 3000);

      pendingTimers.current.set(id, timer);
    },
    [onAccepted],
  );

  useEffect(() => {
    mountedRef.current = true;

    const poll = async () => {
      if (!mountedRef.current) return;
      const all = await EscalationService.getAllEscalations();
      all
        .filter((e) => e.status === 'pending')
        .forEach((e) => scheduleAccept(e.id));
    };

    poll();
    const interval = setInterval(poll, 2000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      pendingTimers.current.forEach((t) => clearTimeout(t));
      pendingTimers.current.clear();
    };
  }, [scheduleAccept]);
}
