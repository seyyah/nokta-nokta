import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Gender = 'male' | 'female';
export type Goal = 'lose' | 'gain' | 'maintain';
export type ActivityLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: Goal;
}

export interface DailyLog {
  id: string;
  createdAt: string;
  mealsText: string;
  waterLiters: number;
  activityLevel: ActivityLevel;
  fitScore: number;
  coachMessage: string;
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
  }[];
}

interface AppContextType {
  profile: UserProfile;
  logs: DailyLog[];
  isReady: boolean;
  saveProfile: (nextProfile: UserProfile) => Promise<void>;
  addLog: (log: DailyLog) => Promise<void>;
  clearLogs: () => Promise<void>;
}

const STORAGE_KEYS = {
  profile: '@fitloop/profile',
  logs: '@fitloop/logs',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  name: 'Kullanici',
  age: 30,
  gender: 'female',
  heightCm: 165,
  weightKg: 64,
  targetWeightKg: 60,
  goal: 'maintain',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const [savedProfile, savedLogs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.logs),
        ]);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile) as UserProfile);
        }
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs) as DailyLog[]);
        }
      } catch (error) {
        console.warn('Failed to load local app state', error);
      } finally {
        setIsReady(true);
      }
    };

    void loadAppState();
  }, []);

  const saveProfile = async (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
  };

  const addLog = async (log: DailyLog) => {
    const updated = [log, ...logs].slice(0, 30);
    setLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(updated));
  };

  const clearLogs = async () => {
    setLogs([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.logs);
  };

  const value = useMemo(
    () => ({
      profile,
      logs,
      isReady,
      saveProfile,
      addLog,
      clearLogs,
    }),
    [profile, logs, isReady],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
