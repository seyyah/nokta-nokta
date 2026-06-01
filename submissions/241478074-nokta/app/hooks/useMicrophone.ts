
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export function useMicrophone() {
  const [permission, setPermission] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  useEffect(() => {
    async function init() {
      const res = await Audio.requestPermissionsAsync();
      setPermission(res.granted);

      if (!res.granted) return;

      const interval = setInterval(() => {
        // TODO: Replace with real PCM extraction pipeline
        setAmplitude(Math.random());
      }, 60);

      return () => clearInterval(interval);
    }

    init();
  }, []);

  return { permission, amplitude };
}
