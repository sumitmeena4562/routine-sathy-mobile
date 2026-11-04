import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CircadianAlarmConfig, DEFAULT_ALARM_CONFIG } from '../types/alarm';
import { getNextAlarmDate, calculateSleepCycles } from '../utils/circadianAlarm';

const STORAGE_KEY = 'sathy_circadian_alarm_config';
const ALARM_NOTIFICATION_TAG = 'sathy-alarm-notification';
const BEDTIME_NOTIFICATION_TAG = 'sathy-bedtime-notification';

// Set notification behavior when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class AlarmSchedulerService {
  private hasInitializedChannels = false;

  async initChannels() {
    if (this.hasInitializedChannels || Platform.OS !== 'android') return;
    try {
      await Notifications.setNotificationChannelAsync('circadian-alarm', {
        name: 'Circadian Wake Alarm',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#F59E0B',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });

      await Notifications.setNotificationChannelAsync('circadian-bedtime', {
        name: 'Circadian Bedtime Wind-Down',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#6366F1',
      });

      this.hasInitializedChannels = true;
    } catch {
      // Channel initialization fallback
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  async loadConfig(): Promise<CircadianAlarmConfig> {
    try {
      let raw: string | null = null;
      if (Platform.OS !== 'web') {
        raw = await SecureStore.getItemAsync(STORAGE_KEY);
      } else if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(STORAGE_KEY);
      }

      if (raw) {
        return { ...DEFAULT_ALARM_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // Storage load fallback
    }
    return DEFAULT_ALARM_CONFIG;
  }

  async saveConfig(config: CircadianAlarmConfig): Promise<void> {
    try {
      const str = JSON.stringify(config);
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(STORAGE_KEY, str);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, str);
      }
    } catch {
      // Storage save fallback
    }
  }

  /**
   * Cancel any previously scheduled alarm & bedtime notifications
   */
  async cancelScheduledAlarms(): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const item of scheduled) {
        const data = item.content.data;
        if (data?.type === ALARM_NOTIFICATION_TAG || data?.type === BEDTIME_NOTIFICATION_TAG) {
          await Notifications.cancelScheduledNotificationAsync(item.identifier);
        }
      }
    } catch {
      // Cancel fallback
    }
  }

  /**
   * Reschedules the next alarm and bedtime notifications based on current config
   */
  async syncScheduledAlarms(config: CircadianAlarmConfig): Promise<{ nextAlarm: Date | null; nextBedtime: Date | null }> {
    await this.initChannels();
    await this.cancelScheduledAlarms();

    if (!config.enabled) {
      return { nextAlarm: null, nextBedtime: null };
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return { nextAlarm: null, nextBedtime: null };
    }

    const nextAlarmDate = getNextAlarmDate(config);
    let nextBedtimeDate: Date | null = null;

    if (nextAlarmDate) {
      try {
        // Schedule Morning Anchor Alarm
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🌅 Morning Anchor Alarm',
            body: config.mission === 'water'
              ? 'Good morning! Drink 1 glass of water to silence the alarm & log 250ml.'
              : 'Good morning! Time to anchor your circadian rhythm.',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: {
              type: ALARM_NOTIFICATION_TAG,
              time: config.time,
              sound: config.sound,
              mission: config.mission,
              gradualRamp: config.gradualRampMinutes,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextAlarmDate,
            channelId: 'circadian-alarm',
          },
        });
      } catch {
        // Schedule fallback
      }

      // Schedule Bedtime Wind-Down Reverse Alarm if enabled
      if (config.bedtimeReminderEnabled) {
        const recommendations = calculateSleepCycles(config.time);
        const optimal = recommendations.find((r) => r.isRecommended) || recommendations[0];

        if (optimal) {
          const [bHourStr, bMinStr] = optimal.bedtime.split(':');
          const bHour = parseInt(bHourStr, 10);
          const bMin = parseInt(bMinStr, 10);

          const bedtimeDate = new Date(nextAlarmDate);
          // If bedtime is PM (e.g. 10:30 PM) and alarm is AM (6:00 AM), it's the night before
          bedtimeDate.setDate(nextAlarmDate.getDate() - 1);
          bedtimeDate.setHours(bHour, bMin, 0, 0);

          const now = new Date();
          if (bedtimeDate.getTime() > now.getTime()) {
            nextBedtimeDate = bedtimeDate;
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '🌙 Circadian Bedtime Wind-Down',
                  body: `Sleep by ${optimal.bedtime} to catch 5 full REM sleep cycles before your ${config.time} AM anchor.`,
                  sound: true,
                  data: {
                    type: BEDTIME_NOTIFICATION_TAG,
                    bedtime: optimal.bedtime,
                  },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: bedtimeDate,
                  channelId: 'circadian-bedtime',
                },
              });
            } catch {
              // Bedtime schedule fallback
            }
          }
        }
      }
    }

    return { nextAlarm: nextAlarmDate, nextBedtime: nextBedtimeDate };
  }
}

export const alarmScheduler = new AlarmSchedulerService();
export default alarmScheduler;
