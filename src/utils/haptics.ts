import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

let lastHapticTimestamp = 0;
// Minimum spacing (180ms) between successive haptic pulses to prevent hardware motor conflict/stutter
const HAPTIC_COOLDOWN_MS = 180;

/**
 * Safe, centralized, throttled haptic feedback dispatcher.
 * Eliminates vibration conflicts, double-buzzes, and motor interruptions across Android & iOS.
 */
export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (Platform.OS === 'web') return;

  const now = Date.now();
  if (now - lastHapticTimestamp < HAPTIC_COOLDOWN_MS) {
    // Drop overlapping vibration call to prevent motor collision
    return;
  }
  lastHapticTimestamp = now;

  try {
    switch (type) {
      case 'warning':
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      case 'selection':
        Haptics.selectionAsync().catch(() => {});
        break;
      case 'light':
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
    }
  } catch {
    // Fail silently if device does not support haptics
  }
}
