export interface RoutineActivity {
  activityId: string;
  name: string;
  value: boolean | number | string;
}

export interface RoutineData {
  _id?: string;
  user?: string;
  date: string; // YYYY-MM-DD
  wakeUpTime?: string; // HH:MM
  waterIntake?: number; // Liters
  studyHours?: number; // Hours
  activities: RoutineActivity[];
  score: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveRoutineInput {
  date: string;
  wakeUpTime?: string;
  waterIntake?: number;
  studyHours?: number;
  activities?: RoutineActivity[];
}

export interface HabitItem {
  id: string;
  name: string;
  type: 'boolean' | 'number';
  unit?: string;
  target?: number;
  icon?: string;
  enabled: boolean;
}

export interface UserGoals {
  targetWakeUp: string;
  targetWater: number;
  targetStudy: number;
}

export interface TrendDay {
  date: string;
  dayName: string;
  score: number;
}

export interface RoutineStats {
  currentStreak: number;
  maxStreak: number;
  avgScore: number;
  totalDays: number;
  last7DaysScores?: TrendDay[];
}
