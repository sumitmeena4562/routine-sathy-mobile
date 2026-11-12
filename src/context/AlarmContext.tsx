import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

  // Active foreground trigger: If app is open when alarm time arrives, trigger immediately!
  useEffect(() => {
    if (!config.enabled || isRinging) return;

    const nextDate = getNextAlarmDate(config);
    if (!nextDate) return;

    const msUntilAlarm = nextDate.getTime() - Date.now();
    // Only schedule timer if alarm is within the next 24 hours
    if (msUntilAlarm > 0 && msUntilAlarm <= 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        setIsRinging(true);
        alarmAudio.startRinging(
          config.sound || 'sunrise-forest',
          config.gradualRampMinutes ?? 2
        );
      }, msUntilAlarm);

      return () => clearTimeout(timer);
    }
  }, [config, isRinging]);

  // Listen for alarm notifications received while app is running
  useEffect(() => {
    const unsubscribe = alarmScheduler.registerListeners(() => {
      setIsRinging(true);
      alarmAudio.startRinging(
        config.sound || 'sunrise-forest',
        config.gradualRampMinutes ?? 2
      );
    });

    return unsubscribe;
  }, [config.sound, config.gradualRampMinutes]);

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
