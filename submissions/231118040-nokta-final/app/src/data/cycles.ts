export type CycleStatus = 'COMMIT' | 'ROLLBACK' | 'STUCK';

export type Cycle = {
  id: number;
  slug: string;
  status: CycleStatus;
  input: string;
  summary: string;
  duration: number;
  kg: number;
};

export const cycles: Cycle[] = [
  {
    duration: 12,
    id: 1,
    input: 'voice-wave-lag.md',
    kg: 5,
    slug: 'voice-response',
    status: 'COMMIT',
    summary: 'Metering update window reduced for immediate wave response.',
  },
  {
    duration: 16,
    id: 2,
    input: 'avatar-mouth-sync.md',
    kg: 11,
    slug: 'viseme-response',
    status: 'COMMIT',
    summary: 'Avaturn mouth targets now track live voice energy.',
  },
  {
    duration: 9,
    id: 3,
    input: 'embedded-call-risk.md',
    kg: 11,
    slug: 'embedded-call',
    status: 'ROLLBACK',
    summary: 'Embedded call hypothesis rejected; reliable Jitsi handoff retained.',
  },
  {
    duration: 20,
    id: 4,
    input: 'expert-escalation.md',
    kg: 11,
    slug: 'expert-bridge',
    status: 'STUCK',
    summary: 'Human verification needed for audio, video and screen sharing.',
  },
];
