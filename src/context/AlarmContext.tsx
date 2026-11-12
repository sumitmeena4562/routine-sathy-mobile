import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { CircadianAlarmConfig, DEFAULT_ALARM_CONFIG } from '../types/alarm';
import { alarmScheduler } from '../services/alarmScheduler';
import { alarmAudio } from '../services/alarmAudio';
import { getAlarmCountdown, getNextAlarmDate } from '../utils/circadianAlarm';
import { routineService, getTodayDateString } from '../services/routine';

interface AlarmContextType {
  config: CircadianAlarmConfig;
  updateConfig: (updates: Partial<CircadianAlarmConfig>) => Promise<void>;
  toggleAlarm: (enabled: boolean) => Promise<void>;
  isRinging: boolean;
  dismissAlarm: (opts?: { waterLogged?: number }) => Promise<void>;
  snoozeAlarm: (minutes?: number) => Promise<boolean>;
  triggerTestAlarm: () => Promise<void>;
  countdownText: string;
  snoozeCount: number;
  maxSnoozes: number;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

const MAX_SNOOZES = 3;

export function AlarmProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CircadianAlarmConfig>(DEFAULT_ALARM_CONFIG);
  const [isRinging, setIsRinging] = useState(false);
  const [countdownText, setCountdownText] = useState('Alarm Off');
  const [snoozeCount, setSnoozeCount] = useState(0);

  // Load saved alarm config on mount
  useEffect(() => {
    let isMounted = true;
    alarmScheduler.loadConfig().then((loaded) => {
      if (isMounted) {
        setConfig(loaded);
        setCountdownText(getAlarmCountdown(loaded));
        alarmScheduler.syncScheduledAlarms(loaded);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Update countdown string periodically
  useEffect(() => {
    const updateCountdown = () => {
      setCountdownText(getAlarmCountdown(config));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 15000);
    return () => clearInterval(timer);
  }, [config]);

  // Central trigger function: starts ringing modal and full-volume sound immediately
  const triggerAlarm = useCallback(async () => {
    if (isRinging) return;
    setIsRinging(true);
    await alarmAudio.startRinging(config.sound || 'sunrise-forest', 0);
  }, [isRinging, config.sound]);

  // Active Foreground, Interval & AppState Monitoring
  // Guarantees alarm triggers with 0 delay when alarm time arrives
  useEffect(() => {
    if (!config.enabled || isRinging) return;

    const checkDueAlarm = () => {
      if (!config.enabled || isRinging) return;

      const now = new Date();
      const todayDay = now.getDay();
      if (!config.days.includes(todayDay)) return;

      const todayStr = now.toISOString().split('T')[0];
      if (config.lastDismissedDate === todayStr && config.lastDismissedTime === config.time) {
        return; // Already dismissed today for this specific alarm time
      }

      const [hourStr, minStr] = config.time.split(':');
      const target = new Date(now);
      target.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0);

      const diffMs = now.getTime() - target.getTime();

      // If within 15 minutes past the alarm time, ring immediately!
      if (diffMs >= 0 && diffMs < 15 * 60 * 1000) {
        triggerAlarm();
      }
    };

    // 1. Check immediately on mount/config update
    checkDueAlarm();

    // 2. Schedule precise timer for next upcoming alarm within next 24 hours
    const nextDate = getNextAlarmDate(config);
    let exactTimer: ReturnType<typeof setTimeout> | null = null;
    if (nextDate) {
      const msUntilAlarm = nextDate.getTime() - Date.now();
      if (msUntilAlarm > 0 && msUntilAlarm <= 24 * 60 * 60 * 1000) {
        exactTimer = setTimeout(checkDueAlarm, msUntilAlarm);
      }
    }

    // 3. High-frequency 3-second ticker while app is in foreground to prevent missed triggers
    const ticker = setInterval(checkDueAlarm, 3000);

    // 4. AppState listener: immediately check when user unlocks or re-enters app
    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkDueAlarm();
      }
    });

    return () => {
      if (exactTimer) clearTimeout(exactTimer);
      clearInterval(ticker);
      appStateSub.remove();
    };
  }, [config, isRinging, triggerAlarm]);

  // Listen for alarm notifications received from OS while app is running
  useEffect(() => {
    const unsubscribe = alarmScheduler.registerListeners(() => {
      triggerAlarm();
    });

    return unsubscribe;
  }, [triggerAlarm]);

  const updateConfig = useCallback(async (updates: Partial<CircadianAlarmConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    setCountdownText(getAlarmCountdown(updated));
    await alarmScheduler.saveConfig(updated);
    await alarmScheduler.syncScheduledAlarms(updated);
  }, [config]);

  const toggleAlarm = useCallback(async (enabled: boolean) => {
    // When re-enabling alarm, clear dismissal flags so it can trigger today if time is future
    await updateConfig({
      enabled,
      ...(enabled ? { lastDismissedDate: undefined, lastDismissedTime: undefined } : {}),
    });
  }, [updateConfig]);

  const dismissAlarm = useCallback(async (opts?: { waterLogged?: number }) => {
    setIsRinging(false);
    setSnoozeCount(0);
    await alarmAudio.stop();
    // Record last dismissed date and time
    const todayStr = new Date().toISOString().split('T')[0];
    await updateConfig({ lastDismissedDate: todayStr, lastDismissedTime: config.time });

    // If user completed water challenge, auto-log water intake and wakeUpTime
    if (opts?.waterLogged) {
      try {
        const todayDate = getTodayDateString();
        const existing = await routineService.getTodayRoutine(todayDate).catch(() => null);
        const currentWater = existing?.waterIntake || 0;
        const newWater = Math.round((currentWater + opts.waterLogged) * 100) / 100;
        await routineService.saveRoutine({
          date: todayDate,
          wakeUpTime: config.time,
          waterIntake: newWater,
          studyHours: existing?.studyHours || 0,
          activities: existing?.activities || [],
        }).catch(() => {});
      } catch {
        // Non-critical background sync
      }
    }
  }, [updateConfig, config.time]);

  const snoozeAlarm = useCallback(async (minutes?: number): Promise<boolean> => {
    if (snoozeCount >= MAX_SNOOZES) {
      return false;
    }
    setIsRinging(false);
    await alarmAudio.stop();
    setSnoozeCount((prev) => prev + 1);
    const snoozeDuration = minutes || config.snoozeMinutes || 5;
    await alarmScheduler.scheduleSnooze(snoozeDuration, config);
    return true;
  }, [config, snoozeCount]);

  // For developer/user test trigger
  const triggerTestAlarm = useCallback(async () => {
    setIsRinging(true);
    await alarmAudio.startRinging(config.sound, 0);
  }, [config.sound]);

  return (
    <AlarmContext.Provider
      value={{
        config,
        updateConfig,
        toggleAlarm,
        isRinging,
        dismissAlarm,
        snoozeAlarm,
        triggerTestAlarm,
        countdownText,
        snoozeCount,
        maxSnoozes: MAX_SNOOZES,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarmContext() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarmContext must be used within an AlarmProvider');
  }
  return context;
}
