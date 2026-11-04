export type AlarmSoundId = 'sunrise-forest' | 'ocean-waves' | 'zen-bowl' | 'energetic-dawn';
export type AlarmMissionType = 'none' | 'water' | 'math';

export interface CircadianAlarmConfig {
  enabled: boolean;
  time: string; // "HH:mm" 24h format, e.g. "06:00"
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  sound: AlarmSoundId;
  gradualRampMinutes: 0 | 2 | 5;
  mission: AlarmMissionType;
  snoozeMinutes: number; // e.g. 5 or 10
  bedtimeReminderEnabled: boolean;
  lastDismissedDate?: string; // "YYYY-MM-DD"
}

export interface BedtimeRecommendation {
  wakeTime: string;
  cycles: number;
  sleepHours: number;
  bedtime: string; // "HH:mm" formatted
  isRecommended: boolean;
}

export const DEFAULT_ALARM_CONFIG: CircadianAlarmConfig = {
  enabled: true,
  time: '06:00',
  days: [1, 2, 3, 4, 5], // Mon to Fri
  sound: 'sunrise-forest',
  gradualRampMinutes: 2,
  mission: 'water',
  snoozeMinutes: 5,
  bedtimeReminderEnabled: true,
};
