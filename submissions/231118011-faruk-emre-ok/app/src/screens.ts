export type RoutePath = "/" | "/reports" | "/forge";

export type ScreenMetric = {
  label: string;
  value: string;
};

export type ScreenData = {
  title: string;
  eyebrow: string;
  body: string;
  metrics: ScreenMetric[];
  primary: string;
  secondary: string;
  accent: string;
};

export const tabs: Array<{ href: RoutePath; label: string }> = [
  { href: "/", label: "Capture" },
  { href: "/reports", label: "Reports" },
  { href: "/forge", label: "Forge" }
];

export const screens: Record<RoutePath, ScreenData> = {
  "/": {
    title: "Capture",
    eyebrow: "Signal intake",
    body: "A compact queue now listens to the tester, draws live amplitude, and drives the Avaturn mouth without moving the audit boundary.",
    metrics: [
      { label: "Open notes", value: "3" },
      { label: "Mic tick", value: "80ms" },
      { label: "Boundary", value: "DI only" }
    ],
    primary: "Latest note: voice bars should move only from microphone metering, then settle to idle in silence.",
    secondary: "Next ratchet: keep mic-to-mouth feedback fast enough to feel immediate in the demo.",
    accent: "#2563EB"
  },
  "/reports": {
    title: "Reports",
    eyebrow: "Artifact shelf",
    body: "Markdown outputs stay small, visual, and ready for a coding agent without backend state.",
    metrics: [
      { label: "Burn-ins", value: "3" },
      { label: "Export types", value: "MD/DOCX" },
      { label: "Screens", value: "3" }
    ],
    primary: "Latest note: exported reports need clear ownership and a stable file name.",
    secondary: "Next ratchet: one screen, one report, one bounded fix.",
    accent: "#059669"
  },
  "/forge": {
    title: "Forge",
    eyebrow: "Ratchet ledger",
    body: "The agent loop reads the audit report, changes one narrow surface, tests, then commits, rolls back, or calls a human expert.",
    metrics: [
      { label: "Commit cycles", value: "2+" },
      { label: "Rollbacks", value: "1" },
      { label: "Bridge", value: "Jitsi" }
    ],
    primary: "Latest note: the bridge must expose video, audio, and screen share from the same expert room.",
    secondary: "Next ratchet: one stuck cycle becomes a call, then the next cycle uses the human decision.",
    accent: "#D97706"
  }
};
