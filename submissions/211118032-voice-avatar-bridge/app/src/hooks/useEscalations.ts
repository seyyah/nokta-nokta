import { useState, useEffect, useCallback, useRef } from 'react';
import { Escalation } from '../types';
import { EscalationService } from '../services/escalationService';

export function useEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await EscalationService.getAllEscalations();
    if (mountedRef.current) {
      setEscalations(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { escalations, loading, refresh: load };
}
