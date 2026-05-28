export type ForgeCycleStatus = 'COMMIT' | 'FAIL' | 'ROLLBACK' | 'STUCK';

export type BridgeTrigger = {
  reason: string;
  shouldOpenBridge: boolean;
  streak: number;
};

export function detectBridgeTrigger(statuses: ForgeCycleStatus[]): BridgeTrigger {
  let streak = 0;

  for (let index = statuses.length - 1; index >= 0; index -= 1) {
    const status = statuses[index];
    if (status === 'FAIL' || status === 'ROLLBACK' || status === 'STUCK') {
      streak += 1;
      continue;
    }
    break;
  }

  if (streak >= 2) {
    return {
      reason: `${streak} consecutive non-commit forge cycles`,
      shouldOpenBridge: true,
      streak,
    };
  }

  return {
    reason: 'Ratchet is still recovering locally.',
    shouldOpenBridge: false,
    streak,
  };
}

export function createJitsiRoomUrl(studentId: string, slug: string) {
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://meet.jit.si/nokta-${studentId}-${safeSlug}#config.prejoinPageEnabled=false`;
}
