import { Ionicons } from '@expo/vector-icons';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
} from '@/theme/tokens.generated';
import { HabitItem } from '@/types/routine';

export interface HabitBrandMeta {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
}

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'workout', name: 'Workout / Exercise', type: 'boolean', icon: 'barbell-outline', enabled: true },
  { id: 'meditation', name: 'Meditation / Mindfulness', type: 'boolean', icon: 'leaf-outline', enabled: true },
  { id: 'reading', name: 'Reading', type: 'boolean', icon: 'glasses-outline', enabled: false },
];

/**
 * Standardizes habit display name (e.g. "Workout / Exercise" -> "Workout").
 */
export function cleanHabitName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return 'Workout';
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return 'Meditation';
  }
  if (lower.includes('read') || lower.includes('book')) {
    return 'Reading';
  }
  return name.replace(/\s*\/\s*.*$/, '');
}

/**
 * Curated brand palette for circadian habits.
 */
export function getHabitBrandMeta(name: string, isDark: boolean): HabitBrandMeta {
  const lower = name.toLowerCase();

  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return {
      icon: 'barbell',
      iconColor: isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[700],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileAmber : SemanticLightTokens.color.bg.tileAmber,
    };
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return {
      icon: 'leaf',
      iconColor: isDark ? PrimitiveTokens.color.fern[300] : PrimitiveTokens.color.fern[500],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileMint : SemanticLightTokens.color.bg.tileMint,
    };
  }
  if (lower.includes('read') || lower.includes('book')) {
    return {
      icon: 'glasses',
      iconColor: isDark ? PrimitiveTokens.color.sky[400] : PrimitiveTokens.color.sky[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileSky : SemanticLightTokens.color.bg.tileSky,
    };
  }
  if (lower.includes('study') || lower.includes('focus') || lower.includes('course')) {
    return {
      icon: 'school',
      iconColor: isDark ? PrimitiveTokens.color.indigo[400] : PrimitiveTokens.color.indigo[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileIndigo : SemanticLightTokens.color.bg.tileIndigo,
    };
  }
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
    return {
      icon: 'water',
      iconColor: isDark ? PrimitiveTokens.color.sky[400] : PrimitiveTokens.color.sky[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileSky : SemanticLightTokens.color.bg.tileSky,
    };
  }
  if (lower.includes('walk') || lower.includes('run') || lower.includes('step')) {
    return {
      icon: 'footsteps',
      iconColor: isDark ? PrimitiveTokens.color.fern[300] : PrimitiveTokens.color.fern[500],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileMint : SemanticLightTokens.color.bg.tileMint,
    };
  }
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night')) {
    return {
      icon: 'moon',
      iconColor: isDark ? PrimitiveTokens.color.indigo[400] : PrimitiveTokens.color.indigo[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileIndigo : SemanticLightTokens.color.bg.tileIndigo,
    };
  }
  return {
    icon: 'sparkles',
    iconColor: isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[700],
    tileBg: isDark ? SemanticDarkTokens.color.bg.tileAmber : SemanticLightTokens.color.bg.tileAmber,
  };
}
