import { CircadianAlarmConfig, BedtimeRecommendation } from '../types/alarm';

/**
 * Format "HH:mm" 24h string to "6:00 AM" or "06:00"
 */
export function formatAlarmTime12hr(timeStr: string): string {
  if (!timeStr) return '06:00 AM';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (isNaN(hour) || isNaN(min)) return timeStr;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 hour is 12 AM
  const formattedMin = min < 10 ? `0${min}` : min;
  return `${hour}:${formattedMin} ${ampm}`;
}

/**
 * Calculates the next trigger timestamp for an alarm based on time & active days.
 */
export function getNextAlarmDate(config: CircadianAlarmConfig): Date | null {
  if (!config.enabled || !config.days || config.days.length === 0) {
    return null;
  }

  const [hourStr, minStr] = config.time.split(':');
  const targetHour = parseInt(hourStr, 10);
  const targetMin = parseInt(minStr, 10);

  const now = new Date();

  // Check next 7 days for the closest active day
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(targetHour, targetMin, 0, 0);

    const dayOfWeek = candidate.getDay(); // 0 = Sun, 1 = Mon ...
    if (config.days.includes(dayOfWeek)) {
      if (candidate.getTime() > now.getTime()) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Returns human-readable countdown string, e.g. "in 7h 20m" or "Tomorrow, 6:00 AM"
 */
export function getAlarmCountdown(config: CircadianAlarmConfig): string {
  if (!config.enabled) return 'Alarm Off';
  const nextDate = getNextAlarmDate(config);
  if (!nextDate) return 'No active days selected';

  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `in ${Math.max(1, diffMinutes)} mins`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  if (hours < 24) {
    return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours} hours`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours > 0) {
    return `in ${days}d ${remainingHours}h`;
  }
  return `in ${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Calculates optimal 90-minute REM sleep cycle bedtimes based on target wake-up time.
 * Standard formula: 15 min to fall asleep + (90 min * cycles).
 */
export function calculateSleepCycles(wakeTimeStr: string): BedtimeRecommendation[] {
  const [hourStr, minStr] = (wakeTimeStr || '06:00').split(':');
  const wakeHour = parseInt(hourStr, 10) || 6;
  const wakeMin = parseInt(minStr, 10) || 0;

  // Base wake date (arbitrary date for calculation)
  const wakeDate = new Date();
  wakeDate.setHours(wakeHour, wakeMin, 0, 0);

  const cycleDefinitions = [
    { cycles: 6, hours: 9.0, isRecommended: false },
    { cycles: 5, hours: 7.5, isRecommended: true }, // Optimal adult REM cycles
    { cycles: 4, hours: 6.0, isRecommended: false },
  ];

  return cycleDefinitions.map(({ cycles, hours, isRecommended }) => {
    // 15 min sleep latency + (cycles * 90 min)
    const minutesToSubtract = 15 + cycles * 90;
    const bedtimeDate = new Date(wakeDate.getTime() - minutesToSubtract * 60 * 1000);

    const bHour = bedtimeDate.getHours();
    const bMin = bedtimeDate.getMinutes();
    const bedtimeFormatted = `${bHour < 10 ? '0' : ''}${bHour}:${bMin < 10 ? '0' : ''}${bMin}`;

    return {
      wakeTime: wakeTimeStr,
      cycles,
      sleepHours: hours,
      bedtime: bedtimeFormatted,
      isRecommended,
    };
  });
}
