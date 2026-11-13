import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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

  // Synchronous refs to prevent race conditions during dismiss, snooze, and fast intervals
  const lastDismissedRef = useRef<{ date: string; time: string } | null>(null);
  const snoozedUntilRef = useRef<number | null>(null);

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

  // Central trigger function: starts ringing modal and audio immediately
  const triggerAlarm = useCallback(async () => {
    if (isRinging) return;
    setIsRinging(true);
    await alarmAudio.startRinging(config.sound || 'sunrise-forest', 0);
  }, [isRinging, config.sound]);

  // Stable ref for triggerAlarm to prevent listener re-subscription loops
  const triggerAlarmRef = useRef(triggerAlarm);
  useEffect(() => {
    triggerAlarmRef.current = triggerAlarm;
  }, [triggerAlarm]);

  // Precision in-app scheduling: fires at the exact millisecond of next alarm
  useEffect(() => {
    if (!config.enabled || isRinging) return;

    const nextDate = getNextAlarmDate(config);
    if (!nextDate) return;

    const msUntilAlarm = nextDate.getTime() - Date.now();
    // Only schedule timer if alarm is within the next 24 hours
    if (msUntilAlarm > 0 && msUntilAlarm <= 24 * 60 * 60 * 1000) {
      const exactTimer = setTimeout(() => {
        const todayStr = getTodayDateString();
        if (
          config.lastDismissedDate === todayStr &&
          config.lastDismissedTime === config.time
        ) {
          return;
        }
        triggerAlarmRef.current();
      }, msUntilAlarm);

      return () => clearTimeout(exactTimer);
    }
  }, [config, isRinging]);

  // AppState listener: If user re-opens app right when alarm is due
  useEffect(() => {
    if (!config.enabled || isRinging) return;

    const handleAppState = (state: AppStateStatus) => {
      if (state !== 'active') return;
      const todayStr = getTodayDateString();
      if (
        config.lastDismissedDate === todayStr &&
        config.lastDismissedTime === config.time
      ) {
        return;
      }
      const [hourStr, minStr] = config.time.split(':');
      const target = new Date();
      target.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0);
      const diffMs = Date.now() - target.getTime();
      // Ring if alarm time passed within last 60 seconds and was not dismissed
      if (diffMs >= 0 && diffMs < 60 * 1000) {
        triggerAlarmRef.current();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [config, isRinging]);

  // Listen for alarm notifications received from OS while app is running (once on mount)
  useEffect(() => {
    const unsubscribe = alarmScheduler.registerListeners(() => {
      triggerAlarmRef.current();
    });

    return unsubscribe;
  }, []);

  const updateConfig = useCallback(async (updates: Partial<CircadianAlarmConfig>) => {
    if (updates.time && updates.time !== config.time) {
      lastDismissedRef.current = null;
      snoozedUntilRef.current = null;
    }
    const updated = { ...config, ...updates };
    setConfig(updated);
    setCountdownText(getAlarmCountdown(updated));
    await alarmScheduler.saveConfig(updated);
    await alarmScheduler.syncScheduledAlarms(updated);
  }, [config]);

  const toggleAlarm = useCallback(async (enabled: boolean) => {
    lastDismissedRef.current = null;
    snoozedUntilRef.current = null;
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

    // Synchronously set dismissal ref so checkDueAlarm does not re-ring
    const todayStr = getTodayDateString();
    lastDismissedRef.current = { date: todayStr, time: config.time };
    snoozedUntilRef.current = null;

    const updated = {
      ...config,
      lastDismissedDate: todayStr,
      lastDismissedTime: config.time,
    };
    setConfig(updated);
    setCountdownText(getAlarmCountdown(updated));
    await alarmScheduler.saveConfig(updated);
    await alarmScheduler.syncScheduledAlarms(updated);

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
  }, [config]);

  const snoozeAlarm = useCallback(async (minutes?: number): Promise<boolean> => {
    if (snoozeCount >= MAX_SNOOZES) {
      return false;
    }
    setIsRinging(false);
    await alarmAudio.stop();
    setSnoozeCount((prev) => prev + 1);
    const snoozeDuration = minutes || config.snoozeMinutes || 5;
    snoozedUntilRef.current = Date.now() + snoozeDuration * 60 * 1000;
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

