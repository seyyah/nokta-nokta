const KEY = 'nokta_sessions';
const MAX = 5;

export const loadSessions = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
};

export const saveSession = (ideas) => {
  try {
    const prev = loadSessions();
    const session = {
      id: Date.now(),
      date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      count: ideas.length,
      ideas,
    };
    const updated = [session, ...prev].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};
