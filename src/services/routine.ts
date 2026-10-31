import { api } from './api';
import {
  HabitItem,
  RoutineData,
  RoutineStats,
  SaveRoutineInput,
  UserGoals,
} from '@/types/routine';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const routineService = {
  /**
   * Fetches today's routine for the logged-in user.
   * Returns RoutineData if logged, or null if no routine exists yet.
   */
  async getTodayRoutine(dateString?: string): Promise<RoutineData | null> {
    const date = dateString || getTodayDateString();
    const response = await api.get<{ data: RoutineData | null; message?: string }>(
      `/routines/today?date=${date}`
    );
    return response.data.data;
  },

  /**
   * Creates or updates a routine for a specific date.
   * Score is calculated on the server.
   */
  async saveRoutine(input: SaveRoutineInput): Promise<RoutineData> {
    const payload = {
      ...input,
      date: input.date || getTodayDateString(),
    };
    const response = await api.post<{ data: RoutineData; message?: string }>(
      '/routines',
      payload
    );
    return response.data.data;
  },

  /**
   * Retrieves active habit definitions configured for the user.
   */
  async getUserHabits(): Promise<HabitItem[]> {
    const response = await api.get<{ success: boolean; habits: HabitItem[] }>(
      '/auth/habits'
    );
    return response.data.habits || [];
  },

  /**
   * Retrieves default targets/goals for the user.
   */
  async getUserGoals(): Promise<UserGoals> {
    const response = await api.get<{ success: boolean; goals: UserGoals }>(
      '/auth/goals'
    );
    return response.data.goals;
  },

  /**
   * Updates default targets/goals for the user.
   */
  async updateUserGoals(goals: Partial<UserGoals>): Promise<UserGoals> {
    const response = await api.put<{ success: boolean; goals: UserGoals }>(
      '/auth/goals',
      goals
    );
    return response.data.goals;
  },

  /**
   * Retrieves overall streak and performance statistics.
   */
  async getRoutineStats(): Promise<RoutineStats> {
    const response = await api.get<any>('/routines/stats');
    const raw = response.data?.data || response.data;
    return {
      currentStreak: raw?.currentStreak || 0,
      maxStreak: raw?.maxStreak ?? raw?.longestStreak ?? 0,
      avgScore: raw?.avgScore || 0,
      totalDays: raw?.totalDays || 0,
      last7DaysScores: raw?.last7DaysScores || [],
    };
  },

  /**
   * Retrieves paginated routine history with full day details.
   */
  async getRoutineHistory(page: number = 1, limit: number = 35): Promise<RoutineData[]> {
    const response = await api.get<{ data: RoutineData[]; pagination?: any }>(
      `/routines?page=${page}&limit=${limit}`
    );
    return response.data?.data || [];
  },
};
