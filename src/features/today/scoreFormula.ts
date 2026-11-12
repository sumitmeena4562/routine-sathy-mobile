import { DayStreakItem } from '@/components/ui/StreakPath';
import { cleanHabitName } from '@/constants/habits';
import {
  HabitItem,
  RoutineActivity,
  RoutineData,
  TrendDay,
  UserGoals,
} from '@/types/routine';
import { formatLocalDate } from '@/utils/dateTime';

/**
 * Distributes fractional score points into integers using the Largest Remainder Method
 * so that the sum of the components (wake + water + study) strictly equals totalScore.
 */
export function distributeScorePoints(
  rawWake: number,
  rawWater: number,
  rawStudy: number,
  totalScore: number
): { wake: number; water: number; study: number } {
  if (totalScore <= 0) {
    return { wake: 0, water: 0, study: 0 };
  }

  const items = [
    { key: 'wake' as const, max: 30, floor: Math.floor(rawWake), rem: rawWake - Math.floor(rawWake) },
    { key: 'water' as const, max: 30, floor: Math.floor(rawWater), rem: rawWater - Math.floor(rawWater) },
    { key: 'study' as const, max: 40, floor: Math.floor(rawStudy), rem: rawStudy - Math.floor(rawStudy) },
  ];

  const currentSum = items[0].floor + items[1].floor + items[2].floor;
  let needed = totalScore - currentSum;

  const result = {
    wake: items[0].floor,
    water: items[1].floor,
    study: items[2].floor,
  };

  // Sort by largest remainder descending
  const sorted = [...items].sort((a, b) => b.rem - a.rem);

  for (const item of sorted) {
    if (needed > 0 && result[item.key] < item.max) {
      result[item.key] += 1;
      needed -= 1;
    }
  }

  // Safety for edge case where totalScore was clamped below floor sum
  if (needed < 0) {
    const revSorted = [...items].sort((a, b) => a.rem - b.rem);
    for (const item of revSorted) {
      if (needed < 0 && result[item.key] > 0) {
        result[item.key] -= 1;
        needed += 1;
      }
    }
  }

  return result;
}

/**
 * Continuous / Progressive Score Formula (Wake 30 · Water 30 · Study 40).
 * Matches landing page specification.
 */
export function calcScoreBreakdown(
  wakeUpTime?: string | null,
  waterIntake: number = 0,
  studyHours: number = 0,
  goals?: UserGoals | null
) {
  const targetWakeUpStr = goals?.targetWakeUp || '06:00';
  const targetWater = goals?.targetWater || 3.0;
  const targetStudy = goals?.targetStudy || 4.0;

  // 1. Wake-up Score (Max 30)
  let wakePts = 0;
  if (wakeUpTime) {
    const [h, m] = wakeUpTime.split(':').map(Number);
    const wakeMinutes = (h || 0) * 60 + (m || 0);

    const [th, tm] = targetWakeUpStr.split(':').map(Number);
    const targetWakeMinutes = (th || 0) * 60 + (tm || 0);
    const limitWakeMinutes = targetWakeMinutes + 240; // 4 hours after target

    if (wakeMinutes <= targetWakeMinutes) {
      wakePts = 30;
    } else if (wakeMinutes < limitWakeMinutes) {
      const penalty = ((wakeMinutes - targetWakeMinutes) / 240) * 30;
      wakePts = Math.max(0, 30 - penalty);
    }
  }

  // 2. Water Score (Max 30)
  let waterPts = 0;
  if (waterIntake > 0 && targetWater > 0) {
    waterPts = Math.min(30, (waterIntake / targetWater) * 30);
  }

  // 3. Study Score (Max 40)
  let studyPts = 0;
  if (studyHours > 0 && targetStudy > 0) {
    studyPts = Math.min(40, (studyHours / targetStudy) * 40);
  }

  const totalScore = Math.max(0, Math.min(100, Math.round(wakePts + waterPts + studyPts)));
  const distributed = distributeScorePoints(wakePts, waterPts, studyPts, totalScore);

  return {
    rawWakePts: wakePts,
    rawWaterPts: waterPts,
    rawStudyPts: studyPts,
    wakePts: distributed.wake,
    waterPts: distributed.water,
    studyPts: distributed.study,
    totalScore,
    targetWakeUp: targetWakeUpStr,
    targetWater,
    targetStudy,
  };
}

export function generateWeekDays(last7DaysScores?: TrendDay[], todayScore: number = 0): DayStreakItem[] {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);

  const scoresByDate = new Map<string, number>();
  if (last7DaysScores) {
    for (const item of last7DaysScores) {
      scoresByDate.set(item.date, item.score);
    }
  }

  return daysOfWeek.map((dayLabel, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = formatLocalDate(d);
    const isToday = index === currentDayIndex;

    const recordedScore = isToday
      ? todayScore
      : scoresByDate.get(dateStr) ?? 0;

    return {
      day: dayLabel,
      date: dateStr,
      isToday,
      score: recordedScore,
      isDone: recordedScore >= 60,
    };
  });
}

/**
 * Builds the merged activities list:
 * - Uses active habits configured in the user profile (enabled !== false).
 * - Matches completion values from today's saved routine if present.
 * - Filters out any habits that the user has explicitly disabled.
 */
export function computeDisplayActivities(
  userHabits: HabitItem[],
  routine: RoutineData | null
): RoutineActivity[] {
  const rawHabits = userHabits && userHabits.length > 0
    ? userHabits
    : [
        { id: 'workout', name: 'Workout / Exercise', enabled: true },
        { id: 'meditation', name: 'Meditation / Mindfulness', enabled: true },
        { id: 'reading', name: 'Reading', enabled: false },
      ];

  const activeHabits = rawHabits.filter((h) => h.enabled !== false);
  const seenKeys = new Set<string>();
  const list: RoutineActivity[] = [];

  for (const habit of activeHabits) {
    const key = cleanHabitName(habit.name).toLowerCase();
    seenKeys.add(key);

    const saved = routine?.activities?.find(
      (a) => a.activityId === habit.id || cleanHabitName(a.name).toLowerCase() === key
    );

    list.push({
      activityId: habit.id,
      name: habit.name,
      value: Boolean(saved?.value),
    });
  }

  // Also include any extra saved routine activity that isn't explicitly disabled
  if (routine?.activities) {
    for (const act of routine.activities) {
      const key = cleanHabitName(act.name).toLowerCase();
      if (!seenKeys.has(key)) {
        const isExplicitlyDisabled = rawHabits.some(
          (h) => h.enabled === false && (h.id === act.activityId || cleanHabitName(h.name).toLowerCase() === key)
        );
        if (!isExplicitlyDisabled) {
          seenKeys.add(key);
          list.push(act);
        }
      }
    }
  }

  return list;
}
