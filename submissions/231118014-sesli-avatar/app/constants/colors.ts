/**
 * Nokta-Nokta theme — OpenAI voice-mode inspired: ink black canvas with
 * a single luminous accent that "breathes" when the mic is hot.
 */
const Colors = {
  bg: "#070708",
  bgElevated: "#101013",
  surface: "#16161B",
  border: "#23232A",
  text: "#F5F5F7",
  textMuted: "#8A8A93",
  textDim: "#56565E",
  accent: "#7DF9C1",
  accentDim: "#3FA37E",
  warn: "#F2C14E",
  danger: "#FF6B6B",
  // Back-compat for existing template files (modal.tsx, +not-found.tsx)
  light: {
    text: "#F5F5F7",
    background: "#070708",
    tint: "#7DF9C1",
    tabIconDefault: "#56565E",
    tabIconSelected: "#7DF9C1",
  },
};

export default Colors;
