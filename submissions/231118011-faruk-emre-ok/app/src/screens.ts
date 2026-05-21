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
    body: "A compact queue for the moment a tester sees a UI issue and wants the context kept intact.",
    metrics: [
      { label: "Open notes", value: "3" },
      { label: "Avg capture", value: "18s" },
      { label: "Boundary", value: "DI only" }
    ],
    primary: "Latest note: CTA spacing felt cramped near the lower action row.",
    secondary: "Next ratchet: keep the capture action visible while the screen stays quiet.",
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
    body: "The agent loop reads the audit report, changes one narrow surface, tests, then commits or rolls back.",
    metrics: [
      { label: "Success cycles", value: "3+" },
      { label: "Rollbacks", value: "1" },
      { label: "Human touches", value: "4" }
    ],
    primary: "Latest note: the ledger must show failed hypotheses instead of hiding them.",
    secondary: "Next ratchet: every cycle earns kg only after typecheck and visual intent pass.",
    accent: "#D97706"
  }
};
