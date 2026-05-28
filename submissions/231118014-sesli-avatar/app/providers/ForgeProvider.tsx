import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

export type CycleStatus = "COMMIT" | "ROLLBACK" | "STUCK";

export type AuditReport = {
  id: string;
  title: string;
  body: string;
  source: "dictate" | "type";
  createdAt: number;
};

export type ForgeCycle = {
  id: string;
  slug: string;
  status: CycleStatus;
  inputReportId: string | null;
  hypothesis: string;
  changes: string;
  test: string;
  durationMin: number;
  notes: string;
  createdAt: number;
};

const KEY_AUDITS = "nokta:audits.v1";
const KEY_CYCLES = "nokta:cycles.v1";

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const [ForgeProvider, useForge] = createContextHook(() => {
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [cycles, setCycles] = useState<ForgeCycle[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const [a, c] = await Promise.all([
          AsyncStorage.getItem(KEY_AUDITS),
          AsyncStorage.getItem(KEY_CYCLES),
        ]);
        if (a) setAudits(JSON.parse(a) as AuditReport[]);
        if (c) setCycles(JSON.parse(c) as ForgeCycle[]);
      } catch (e) {
        console.log("[ForgeProvider] hydrate error", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY_AUDITS, JSON.stringify(audits)).catch((e) =>
      console.log("[ForgeProvider] persist audits", e),
    );
  }, [audits, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY_CYCLES, JSON.stringify(cycles)).catch((e) =>
      console.log("[ForgeProvider] persist cycles", e),
    );
  }, [cycles, hydrated]);

  const addAudit = useCallback((input: Omit<AuditReport, "id" | "createdAt">): AuditReport => {
    const audit: AuditReport = { ...input, id: uid(), createdAt: Date.now() };
    setAudits((prev) => [audit, ...prev]);
    return audit;
  }, []);

  const removeAudit = useCallback((id: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addCycle = useCallback((input: Omit<ForgeCycle, "id" | "createdAt">): ForgeCycle => {
    const cycle: ForgeCycle = { ...input, id: uid(), createdAt: Date.now() };
    setCycles((prev) => [cycle, ...prev]);
    return cycle;
  }, []);

  const removeCycle = useCallback((id: string) => {
    setCycles((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const stats = useMemo(() => {
    const commit = cycles.filter((c) => c.status === "COMMIT").length;
    const rollback = cycles.filter((c) => c.status === "ROLLBACK").length;
    const stuck = cycles.filter((c) => c.status === "STUCK").length;
    return { commit, rollback, stuck, total: cycles.length };
  }, [cycles]);

  return {
    audits,
    cycles,
    stats,
    hydrated,
    addAudit,
    removeAudit,
    addCycle,
    removeCycle,
  };
});
