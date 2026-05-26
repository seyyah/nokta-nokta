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
    duration: 4,
    id: 1,
    input: '02-forge-stuck-visibility.md',
    kg: 4,
    slug: 'stuck-visibility',
    status: 'COMMIT',
    summary: 'STUCK expert action moved into the first visible viewport.',
  },
  {
    duration: 4,
    id: 2,
    input: '03-bridge-sharing-status.md',
    kg: 4,
    slug: 'false-share-state',
    status: 'ROLLBACK',
    summary: 'A false share-ready status was rejected before release.',
  },
  {
    duration: 5,
    id: 3,
    input: '03-bridge-sharing-status.md',
    kg: 5,
    slug: 'sharing-instruction',
    status: 'COMMIT',
    summary: 'In-call screen sharing step is now explicitly described.',
  },
  {
    duration: 20,
    id: 4,
    input: '03-bridge-sharing-status.md',
    kg: 5,
    slug: 'live-bridge-proof',
    status: 'STUCK',
    summary: 'Live audio, video and screen sharing recording is still required.',
  },
];
