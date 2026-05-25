const tintColorLight = '#7c3aed';
const tintColorDark = '#a78bfa';

export default {
  light: {
    text: '#1e293b',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    card: '#f8fafc',
    border: '#f1f5f9',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f0f9ff',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a', // Deep navy/slate instead of pure black
    tint: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    card: '#1e293b',
    border: '#334155',
    primary: '#a78bfa',
    secondary: '#f472b6',
  },
};
