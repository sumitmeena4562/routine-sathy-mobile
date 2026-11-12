import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { AlarmSoundId } from '../types/alarm';

// Bundled offline-first local circadian sound assets
const LOCAL_SOUND_SOURCES: Record<AlarmSoundId, any> = {
  'sunrise-forest': require('../../assets/sounds/sunrise-forest.wav'),
  'ocean-waves': require('../../assets/sounds/ocean-waves.wav'),
  'zen-bowl': require('../../assets/sounds/zen-bowl.wav'),
  'energetic-dawn': require('../../assets/sounds/energetic-dawn.wav'),
};

// Safe runtime resolution for expo-audio
function getAudioModule(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-audio');
  } catch {
    return null;
  }
}

// Pre-resolve asset to local device file URI for reliable offline playback
async function resolveLocalAssetUri(soundSource: any): Promise<string | any> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Asset } = require('expo-asset');
    const asset = Asset.fromModule(soundSource);
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }
    return asset.localUri || asset.uri || soundSource;
  } catch {
    return soundSource;
  }
}

class AlarmAudioService {
  private player: any = null;
  private isRinging: boolean = false;
  private rampTimer: ReturnType<typeof setInterval> | null = null;
  private hapticTimer: ReturnType<typeof setInterval> | null = null;
  private currentVolume: number = 1.0;
  private webAudio: HTMLAudioElement | null = null;

  async initAudioMode() {
    try {
      const audioMod = getAudioModule();
      if (audioMod?.setAudioModeAsync) {
        await audioMod.setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      }
      if (audioMod?.setIsAudioActiveAsync) {
        await audioMod.setIsAudioActiveAsync(true);
      }
    } catch {
      // Audio mode fallback
    }
  }

  /**
   * Play preview of selected sound tone (plays 5 seconds at full volume, then stops)
   */
  async playPreview(soundId: AlarmSoundId): Promise<() => void> {
    await this.stop();
    await this.initAudioMode();

    try {
      const soundSource = LOCAL_SOUND_SOURCES[soundId] || LOCAL_SOUND_SOURCES['sunrise-forest'];
      const resolvedUri = await resolveLocalAssetUri(soundSource);
      const audioMod = getAudioModule();

      let played = false;

      if (audioMod?.createAudioPlayer) {
        try {
          const player = audioMod.createAudioPlayer(
            typeof resolvedUri === 'string' ? { uri: resolvedUri } : resolvedUri,
            { keepAudioSessionActive: true }
          );
          if (player) {
            player.volume = 1.0;
            player.loop = false;
            player.play();
            this.player = player;
            played = true;
          }
        } catch {
          // Native player fallback
        }
      }

      // Web HTML5 Audio fallback
      if (!played && Platform.OS === 'web' && typeof Audio !== 'undefined') {
        try {
          const audioUri = typeof resolvedUri === 'string' ? resolvedUri : resolvedUri?.uri || '';
          if (audioUri) {
            const htmlAudio = new Audio(audioUri);
            htmlAudio.volume = 1.0;
            htmlAudio.play().catch(() => {});
            this.webAudio = htmlAudio;
            played = true;
          }
        } catch {
          // Fallback
        }
      }

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const timer = setTimeout(() => {
        this.stop();
      }, 5000);

      return () => {
        clearTimeout(timer);
        this.stop();
      };
    } catch {
      return () => {
        this.stop();
      };
    }
  }

  /**
   * Start ringing the alarm at full wake volume with rhythmic haptics
   */
  async startRinging(soundId: AlarmSoundId = 'sunrise-forest', rampMinutes: 0 | 2 | 5 = 0): Promise<void> {
    if (this.isRinging) return;
    this.isRinging = true;

    await this.initAudioMode();

    const soundSource = LOCAL_SOUND_SOURCES[soundId] || LOCAL_SOUND_SOURCES['sunrise-forest'];
    const resolvedUri = await resolveLocalAssetUri(soundSource);

    // Start at minimum 70% if ramping, otherwise 100% full volume
    this.currentVolume = rampMinutes === 0 ? 1.0 : 0.7;

    let played = false;
    try {
      const audioMod = getAudioModule();
      if (audioMod?.createAudioPlayer) {
        const player = audioMod.createAudioPlayer(
          typeof resolvedUri === 'string' ? { uri: resolvedUri } : resolvedUri,
          { keepAudioSessionActive: true }
        );
        if (player) {
          player.volume = this.currentVolume;
          player.loop = true;
          player.play();
          this.player = player;
          played = true;
        }
      }
    } catch {
      // Audio player fallback
    }

    // Web HTML5 Audio fallback
    if (!played && Platform.OS === 'web' && typeof Audio !== 'undefined') {
      try {
        const audioUri = typeof resolvedUri === 'string' ? resolvedUri : resolvedUri?.uri || '';
        if (audioUri) {
          const htmlAudio = new Audio(audioUri);
          htmlAudio.loop = true;
          htmlAudio.volume = this.currentVolume;
          htmlAudio.play().catch(() => {});
          this.webAudio = htmlAudio;
        }
      } catch {
        // Fallback
      }
    }

    // Start rhythmic circadian haptics (gentle pulses)
    this.startRhythmicHaptics();

    // If gradual crescendo ramp requested, increase volume incrementally to 1.0
    if (rampMinutes > 0 && this.currentVolume < 1.0) {
      const totalSteps = 10;
      const stepDurationMs = (rampMinutes * 60 * 1000) / totalSteps;
      const volumeIncrement = (1.0 - this.currentVolume) / totalSteps;

      this.rampTimer = setInterval(() => {
        if (!this.isRinging || (!this.player && !this.webAudio)) {
          if (this.rampTimer) clearInterval(this.rampTimer);
          return;
        }

        this.currentVolume = Math.min(1.0, this.currentVolume + volumeIncrement);
        try {
          if (this.player) {
            this.player.volume = this.currentVolume;
          }
          if (this.webAudio) {
            this.webAudio.volume = this.currentVolume;
          }
        } catch {
          // Ignore volume update error
        }

        if (this.currentVolume >= 1.0 && this.rampTimer) {
          clearInterval(this.rampTimer);
          this.rampTimer = null;
        }
      }, stepDurationMs);
    }
  }

  private startRhythmicHaptics() {
    if (Platform.OS === 'web') return;

    // Pattern: pulse, pulse, pause...
    let pulseCount = 0;
    this.hapticTimer = setInterval(() => {
      if (!this.isRinging) {
        if (this.hapticTimer) clearInterval(this.hapticTimer);
        return;
      }

      pulseCount++;
      if (pulseCount % 3 !== 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }, 800);
  }

  /**
   * Stop alarm sound and haptics completely
   */
  async stop(): Promise<void> {
    this.isRinging = false;

    if (this.rampTimer) {
      clearInterval(this.rampTimer);
      this.rampTimer = null;
    }

    if (this.hapticTimer) {
      clearInterval(this.hapticTimer);
      this.hapticTimer = null;
    }

    if (this.player) {
      try {
        if (typeof this.player.pause === 'function') {
          this.player.pause();
        }
        if (typeof this.player.remove === 'function') {
          this.player.remove();
        }
      } catch {
        // Player cleanup error ignored
      } finally {
        this.player = null;
      }
    }

    if (this.webAudio) {
      try {
        this.webAudio.pause();
        this.webAudio.currentTime = 0;
      } catch {
        // Web audio cleanup
      } finally {
        this.webAudio = null;
      }
    }
  }

  getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const alarmAudio = new AlarmAudioService();
export default alarmAudio;
