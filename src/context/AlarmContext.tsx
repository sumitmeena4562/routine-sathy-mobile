import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CircadianAlarmConfig, DEFAULT_ALARM_CONFIG } from '../types/alarm';
import { alarmScheduler } from '../services/alarmScheduler';
import { alarmAudio } from '../services/alarmAudio';
import { getAlarmCountdown } from '../utils/circadianAlarm';
import { routineService, getTodayDateString } from '../services/routine';

interface AlarmContextType {
  config: CircadianAlarmConfig;
  updateConfig: (updates: Partial<CircadianAlarmConfig>) => Promise<void>;
  toggleAlarm: (enabled: boolean) => Promise<void>;
  isRinging: boolean;
  dismissAlarm: (opts?: { waterLogged?: number }) => Promise<void>;
  snoozeAlarm: (minutes?: number) => Promise<void>;
  triggerTestAlarm: () => Promise<void>;
  countdownText: string;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export function AlarmProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CircadianAlarmConfig>(DEFAULT_ALARM_CONFIG);
  const [isRinging, setIsRinging] = useState(false);
  const [countdownText, setCountdownText] = useState('Alarm Off');

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
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [config]);

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
    await updateConfig({ enabled });
  }, [updateConfig]);

  const dismissAlarm = useCallback(async (opts?: { waterLogged?: number }) => {
    setIsRinging(false);
    await alarmAudio.stop();
    // Record last dismissed date
    const todayStr = new Date().toISOString().split('T')[0];
    await updateConfig({ lastDismissedDate: todayStr });

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

  const snoozeAlarm = useCallback(async (minutes?: number) => {
    setIsRinging(false);
    await alarmAudio.stop();
    const snoozeDuration = minutes || config.snoozeMinutes || 5;
    await alarmScheduler.scheduleSnooze(snoozeDuration, config);
  }, [config]);

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
