import { RoutineData } from '@/types/routine';
import { Storage } from '@/utils/storage';
import { routineService } from '@/services/routine';

const OFFLINE_ROUTINE_KEY = 'sathy_offline_pending_routine';

export interface OfflinePendingRoutine {
  data: Partial<RoutineData>;
  timestamp: number;
}

export const offlineQueue = {
  /**
   * Save a failed mutation to persistent storage
   */
  async queuePendingRoutine(routine: Partial<RoutineData>): Promise<void> {
    try {
      const item: OfflinePendingRoutine = {
        data: routine,
        timestamp: Date.now(),
      };
      await Storage.setItem(OFFLINE_ROUTINE_KEY, JSON.stringify(item));
      if (__DEV__) {
        console.log('💾 [OFFLINE QUEUE] Routine saved to offline queue:', routine.date);
      }
    } catch {
      // Storage fallback
    }
  },

  /**
   * Get pending routine from offline storage
   */
  async getPendingRoutine(): Promise<OfflinePendingRoutine | null> {
    try {
      const raw = await Storage.getItem(OFFLINE_ROUTINE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Clear offline queue after successful sync
   */
  async clearPendingRoutine(): Promise<void> {
    try {
      await Storage.removeItem(OFFLINE_ROUTINE_KEY);
    } catch {
      // Storage fallback
    }
  },

  /**
   * Attempt to sync queued offline routines to the backend
   * Returns true if flushed, false if network error or nothing to sync
   */
  async flushPendingRoutine(): Promise<RoutineData | null> {
    try {
      const pending = await this.getPendingRoutine();
      if (!pending || !pending.data) return null;

      const dataToSave = pending.data;
      const saved = await routineService.saveRoutine({
        date: dataToSave.date || new Date().toISOString().split('T')[0],
        wakeUpTime: dataToSave.wakeUpTime,
        waterIntake: dataToSave.waterIntake,
        studyHours: dataToSave.studyHours,
        activities: dataToSave.activities,
      });

      // Clear after successful sync
      await this.clearPendingRoutine();
      if (__DEV__) {
        console.log('✅ [OFFLINE QUEUE] Pending routine synced successfully to cloud:', saved.date);
      }
      return saved;
    } catch (err) {
      if (__DEV__) {
        console.log('⏳ [OFFLINE QUEUE] Cloud sync attempt failed, keeping in offline queue:', err);
      }
      return null;
    }
  },
};
