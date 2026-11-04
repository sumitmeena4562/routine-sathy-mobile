import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { AlarmSoundId } from '../types/alarm';

// Reliable high-quality royalty-free ambient circadian loops (Hosted on fast CDN)
const SOUND_SOURCES: Record<AlarmSoundId, string> = {
  'sunrise-forest': 'https://actions.google.com/sounds/v1/nature/morning_birds.ogg',
  'ocean-waves': 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg',
  'zen-bowl': 'https://actions.google.com/sounds/v1/ambiences/temple_bell_reverb.ogg',
  'energetic-dawn': 'https://actions.google.com/sounds/v1/foley/wind_chimes_ringing.ogg',
};

class AlarmAudioService {
  private soundObject: Audio.Sound | null = null;
  private isRinging: boolean = false;
  private rampTimer: ReturnType<typeof setInterval> | null = null;
  private hapticTimer: ReturnType<typeof setInterval> | null = null;
  private currentVolume: number = 0.1;

  async initAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch {
      // Audio mode fallback
    }
  }

  /**
   * Play preview of selected sound tone (plays 4 seconds then stops)
   */
  async playPreview(soundId: AlarmSoundId): Promise<() => void> {
    await this.stop();
    await this.initAudioMode();

    try {
      const uri = SOUND_SOURCES[soundId] || SOUND_SOURCES['sunrise-forest'];
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.8, isLooping: false }
      );
      this.soundObject = sound;

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Auto stop after 5s
      const timer = setTimeout(() => {
        this.stop();
      }, 5000);

      return () => {
        clearTimeout(timer);
        this.stop();
      };
    } catch {
      // Audio preview error fallback
      return () => {};
    }
  }

  /**
   * Start ringing the alarm with optional gradual volume ramping
   */
  async startRinging(soundId: AlarmSoundId, rampMinutes: 0 | 2 | 5 = 2) {
    if (this.isRinging) return;
    this.isRinging = true;

    await this.initAudioMode();

    try {
      const uri = SOUND_SOURCES[soundId] || SOUND_SOURCES['sunrise-forest'];
      this.currentVolume = rampMinutes > 0 ? 0.1 : 1.0;

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true, volume: this.currentVolume }
      );
      this.soundObject = sound;

      // Start volume ramping
      if (rampMinutes > 0) {
        const totalSteps = 20;
        const intervalMs = (rampMinutes * 60 * 1000) / totalSteps;
        const stepVolume = (1.0 - 0.1) / totalSteps;

        this.rampTimer = setInterval(async () => {
          if (!this.isRinging || !this.soundObject) {
            if (this.rampTimer) clearInterval(this.rampTimer);
            return;
          }
          this.currentVolume = Math.min(1.0, this.currentVolume + stepVolume);
          try {
            await this.soundObject.setVolumeAsync(this.currentVolume);
          } catch {
            // Ignore volume set error
          }
          if (this.currentVolume >= 1.0 && this.rampTimer) {
            clearInterval(this.rampTimer);
          }
        }, intervalMs);
      }

      // Start gentle rhythmic haptic pulsation
      if (Platform.OS !== 'web') {
        this.hapticTimer = setInterval(() => {
          if (!this.isRinging) {
            if (this.hapticTimer) clearInterval(this.hapticTimer);
            return;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 3000);
      }
    } catch {
      // Ringing fallback
    }
  }

  /**
   * Silence & stop the alarm audio & haptics
   */
  async stop() {
    this.isRinging = false;

    if (this.rampTimer) {
      clearInterval(this.rampTimer);
      this.rampTimer = null;
    }
    if (this.hapticTimer) {
      clearInterval(this.hapticTimer);
      this.hapticTimer = null;
    }

    if (this.soundObject) {
      try {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
      } catch {
        // Ignore stop error
      } finally {
        this.soundObject = null;
      }
    }
  }

  getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const alarmAudio = new AlarmAudioService();
export default alarmAudio;
