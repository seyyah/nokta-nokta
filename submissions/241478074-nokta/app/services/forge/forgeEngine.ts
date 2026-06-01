
export type ForgeState =
  | 'IDLE'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAIL'
  | 'ROLLBACK'
  | 'STUCK';

export interface ForgeCycle {
  timestamp: string;
  duration: number;
  retries: number;
  state: ForgeState;
  summary: string;
}

export function detectStuck(cycles: ForgeCycle[]) {
  const latest = cycles.slice(-2);

  return latest.every(
    cycle => cycle.state === 'FAIL' || cycle.state === 'ROLLBACK'
  );
}
