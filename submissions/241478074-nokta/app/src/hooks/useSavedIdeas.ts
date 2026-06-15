import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nokta_saved_ideas_v1';

/**
 * useSavedIdeas — Cycle 1 forge çıktısı
 * Audit raporu: audit-001-idea-detail-save.md
 * Commit: [FORGE: IdeaDetailScreen] Save butonu eklendi — 3kg
 */
export function useSavedIdeas() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setSaved(JSON.parse(raw) as string[]);
    }).catch(() => {});
  }, []);

  const toggleSave = async (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((s) => s !== id)
      : [...saved, id];
    setSaved(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return {
    saved,
    toggleSave,
    isSaved: (id: string) => saved.includes(id),
  };
}
