import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Storage } from '@/utils/storage';

export type Chronotype = 'sunrise_riser' | 'balanced_pacer' | 'night_mind';

export type GoalId =
  | 'morning_grounding'
  | 'deep_work'
  | 'mindful_movement'
  | 'stress_relief'
  | 'digital_sunset'
  | 'deep_sleep';

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  chronotype: Chronotype;
  wakeTime: string;
  goals: GoalId[];
}

interface OnboardingContextType extends OnboardingData {
  isLoading: boolean;
  setChronotype: (chronotype: Chronotype) => void;
  setWakeTime: (wakeTime: string) => void;
  toggleGoal: (goal: GoalId) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const STORAGE_KEY = 'routine_sathy_onboarding_v1';

const DEFAULT_STATE: OnboardingData = {
  hasCompletedOnboarding: false,
  chronotype: 'balanced_pacer',
  wakeTime: '07:00 AM',
  goals: ['morning_grounding', 'deep_work', 'deep_sleep'],
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const raw = await Storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setData((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // Fallback to default
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedData();
  }, []);

  const setChronotype = useCallback((chronotype: Chronotype) => {
    setData((prev) => ({ ...prev, chronotype }));
  }, []);

  const setWakeTime = useCallback((wakeTime: string) => {
    setData((prev) => ({ ...prev, wakeTime }));
  }, []);

  const toggleGoal = useCallback((goal: GoalId) => {
    setData((prev) => {
      const exists = prev.goals.includes(goal);
      const newGoals = exists
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals: newGoals };
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    const updated: OnboardingData = {
      ...data,
      hasCompletedOnboarding: true,
    };
    setData(updated);
    await Storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [data]);

  const resetOnboarding = useCallback(async () => {
    setData(DEFAULT_STATE);
    await Storage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...data,
        isLoading,
        setChronotype,
        setWakeTime,
        toggleGoal,
        completeOnboarding,
        resetOnboarding,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
