export type ScreenKey = "capture" | "reports" | "forge" | "bridge";

export type ScreenMetric = {
  label: string;
  value: string;
};

export type ScreenAction = {
  title: string;
  detail: string;
};

export type ScreenData = {
  key: ScreenKey;
  route: "/" | "/reports" | "/forge" | "/bridge";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  metrics: ScreenMetric[];
  actions: ScreenAction[];
  accent: string;
};

export const screens: ScreenData[] = [
  {
    key: "capture",
    route: "/",
    label: "Capture",
    eyebrow: "Phase A",
    title: "Yakalama masasi",
    summary:
      "Tester ekrani, canli mikrofon seviyesi ve avatar agiz tepkisi ayni audit akisi icinde izlenir. FAB her route ustunde ayni host sinirindan calisir.",
    metrics: [
      { label: "input", value: "mic" },
      { label: "meter", value: "80ms" },
      { label: "avatar", value: "glb" }
    ],
    actions: [
      {
        title: "Voice trace",
        detail: "Ses seviyesi Expo AV metering degerinden yumusatilarak gorsellestirilir."
      },
      {
        title: "Mouth response",
        detail: "Avatar agzi sessizlikte kapali kalir, konusma seviyesinde acilir."
      }
    ],
    accent: "#2f6f66"
  },
  {
    key: "reports",
    route: "/reports",
    label: "Reports",
    eyebrow: "Artifact",
    title: "Rapor panosu",
    summary:
      "Markdown ve Word ciktilari ayni not havuzundan beslenir. Host depolama karari uygulama tarafinda kalir, widget sadece deps sozlesmesini okur.",
    metrics: [
      { label: "open", value: "3" },
      { label: "fixed", value: "0" },
      { label: "format", value: "md/docx" }
    ],
    actions: [
      {
        title: "Export okunurlugu",
        detail: "Agent input bolumu insan notu, secim bounds ve kanit gorselinden ayrilir."
      },
      {
        title: "Share sheet",
        detail: "Dosya disari sadece host paylasim kanaliyla cikar."
      }
    ],
    accent: "#175cd3"
  },
  {
    key: "forge",
    route: "/forge",
    label: "Forge",
    eyebrow: "Phase B",
    title: "Ratchet ledger",
    summary:
      "Her cycle tek hipotez, tek degisiklik ve tek test kanitiyla ilerler. Basarisiz hipotezler silinmez; sonraki cycle icin hafiza olur.",
    metrics: [
      { label: "success", value: "3" },
      { label: "rollback", value: "1" },
      { label: "kg", value: "24" }
    ],
    actions: [
      {
        title: "Minimal fix",
        detail: "Rapor intenti disina tasan refactor yok."
      },
      {
        title: "Verify",
        detail: "Typecheck ve expo install check ratchet kapisi olur."
      }
    ],
    accent: "#027a48"
  },
  {
    key: "bridge",
    route: "/bridge",
    label: "Bridge",
    eyebrow: "Phase C",
    title: "Uzman baglanti akisi",
    summary:
      "Audit akisi tikaninca kullanici ayni vaka baglamiyla Jitsi Meet odasina aktarilir; audio, video ve screen share gercek servis uzerinden acilir.",
    metrics: [
      { label: "audio", value: "on" },
      { label: "video", value: "on" },
      { label: "share", value: "web" }
    ],
    actions: [
      {
        title: "Escalation packet",
        detail: "Aktif route, not, secim bounds ve ses/avatar bulgusu uzman konusmasina tasinir."
      },
      {
        title: "External bridge",
        detail: "Native arama ekrani taklit edilmez; Jitsi odasi gercek baglanti hedefidir."
      }
    ],
    accent: "#4a5568"
  }
];

export const getScreen = (key: ScreenKey) => {
  const screen = screens.find((item) => item.key === key);

  if (!screen) {
    throw new Error(`Unknown screen key: ${key}`);
  }

  return screen;
};
