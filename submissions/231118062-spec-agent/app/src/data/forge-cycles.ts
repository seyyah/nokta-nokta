export type ForgeStatus = 'SUCCESS' | 'ROLLBACK' | 'STUCK';

export type ForgeCycle = {
  id: number;
  report: string;
  hypothesis: string;
  result: ForgeStatus;
  changedFiles: string;
  tests: string;
  commit: string;
  kg: string;
  humanTouches: number;
};

export const FORGE_CYCLES: ForgeCycle[] = [
  {
    id: 1,
    report: 'audit-reports/voice-visualizer.md',
    hypothesis: 'The home screen does not prove the microphone loop; add a dedicated voice visualizer.',
    result: 'SUCCESS',
    changedFiles: 'app/(tabs)/voice.tsx, src/hooks/use-microphone-level.ts',
    tests: 'Manual mic burn-in, metering stays under 200ms visual latency.',
    commit: 'pending-demo',
    kg: '4kg',
    humanTouches: 0,
  },
  {
    id: 2,
    report: 'audit-reports/avatar-lipsync.md',
    hypothesis: 'The avatar needs a real GLB stage with audio-driven mouth morphs.',
    result: 'SUCCESS',
    changedFiles: 'src/components/avatar-stage.tsx, app/(tabs)/avatar.tsx',
    tests: 'Avatar loads from avatar.glb; mouth targets react to RMS level.',
    commit: 'pending-demo',
    kg: '6kg',
    humanTouches: 1,
  },
  {
    id: 3,
    report: 'audit-reports/forge-rollback.md',
    hypothesis: 'A full WebRTC embed should be implemented before the demo script is stable.',
    result: 'ROLLBACK',
    changedFiles: 'none',
    tests: 'Rejected: it adds risk before the voice/avatar loop is verified.',
    commit: 'rollback',
    kg: '2kg',
    humanTouches: 0,
  },
  {
    id: 4,
    report: 'audit-reports/stuck-bridge.md',
    hypothesis: 'Two repeated failures should trigger the expert bridge automatically.',
    result: 'STUCK',
    changedFiles: 'app/(tabs)/forge.tsx, BRIDGE.md',
    tests: 'Expert bridge is queued; Jitsi demo link remains final manual step.',
    commit: 'bridge-pending',
    kg: '8kg',
    humanTouches: 1,
  },
];
