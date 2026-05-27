import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ForgeContext = createContext({
  cycles: [],
  consecutiveFailures: 0,
  stuck: false,
  addCycle: () => {},
  resetStuck: () => {},
});

export function ForgeProvider({ children }) {
  const [cycles, setCycles] = useState([
    { id: 1, report: '01-home-swipe-archive.md', result: 'SUCCESS', kg: 20 },
    { id: 2, report: '02-detail-sort-toggle.md', result: 'SUCCESS', kg: 15 },
    { id: 3, report: '03-profile-quick-theme.md', result: 'SUCCESS', kg: 15 },
    { id: 4, report: '04-settings-i18n-bug.md', result: 'ROLLBACK', kg: 0 },
  ]);
  const [consecutiveFailures, setConsecutiveFailures] = useState(1); // Cycle 4 rollback'ten devam
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (consecutiveFailures >= 2) {
      setStuck(true);
    } else {
      setStuck(false);
    }
  }, [consecutiveFailures]);

  const addCycle = useCallback((report, result) => {
    const newCycle = {
      id: cycles.length + 1,
      report,
      result,
      kg: result === 'SUCCESS' ? 20 : 0,
    };
    setCycles(prev => [...prev, newCycle]);

    if (result === 'SUCCESS') {
      setConsecutiveFailures(0);
    } else {
      setConsecutiveFailures(prev => {
        const next = prev + 1;
        if (next >= 2) {
          setStuck(true);
        }
        return next;
      });
    }
  }, [cycles.length]);

  const resetStuck = useCallback(() => {
    setStuck(false);
    setConsecutiveFailures(0);
  }, []);

  return (
    <ForgeContext.Provider value={{ cycles, consecutiveFailures, stuck, addCycle, resetStuck }}>
      {children}
    </ForgeContext.Provider>
  );
}

export function useForge() {
  return useContext(ForgeContext);
}
