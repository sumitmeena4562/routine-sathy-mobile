import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import {
  AmbientAtmosphere,
  Button,
  Card,
  Toast,
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { HabitItem, RoutineActivity } from '@/types/routine';
import { triggerHaptic } from '@/utils/haptics';

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'workout', name: 'Workout', type: 'boolean', icon: 'barbell-outline', enabled: true },
  { id: 'meditation', name: 'Meditation', type: 'boolean', icon: 'leaf-outline', enabled: true },
  { id: 'reading', name: 'Reading', type: 'boolean', icon: 'glasses-outline', enabled: true },
];

/**
 * Curated brand palette matching Today dashboard
 */
function getHabitBrandMeta(name: string, isDark: boolean): {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
} {
  const lower = name.toLowerCase();

  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return {
      icon: 'barbell',
      iconColor: isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[700],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileAmber : SemanticLightTokens.color.bg.tileAmber,
    };
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath') || lower.includes('yoga')) {
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
  if (lower.includes('study') || lower.includes('focus') || lower.includes('course') || lower.includes('work')) {
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
  if (lower.includes('walk') || lower.includes('run') || lower.includes('step') || lower.includes('jog')) {
    return {
      icon: 'footsteps',
      iconColor: isDark ? PrimitiveTokens.color.fern[300] : PrimitiveTokens.color.fern[500],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileMint : SemanticLightTokens.color.bg.tileMint,
    };
  }
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night') || lower.includes('rest')) {
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

export default function AddRoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 460;
  const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 20;

  // Track if today's routine exists (edit mode vs create mode)
  const [isExistingRoutine, setIsExistingRoutine] = useState(false);

  // Today's Logged Progress (preserved so editing habits doesn't wipe today's metrics)
  const [todayWakeUpTime, setTodayWakeUpTime] = useState<string | null>(null);
  const [todayWaterLogged, setTodayWaterLogged] = useState(0);
  const [todayStudyLogged, setTodayStudyLogged] = useState(0);
  const [existingCompletionMap, setExistingCompletionMap] = useState<
    Record<string, boolean | string | number>
  >({});

  // Habits management
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(
    new Set(['workout', 'meditation'])
  );

  // Inline custom habit creation
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [addingHabitLoading, setAddingHabitLoading] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load defaults and user habits
  useEffect(() => {
    async function loadDefaults() {
      try {
        const [todayRoutineRes, serverHabitsRes] = await Promise.allSettled([
          routineService.getTodayRoutine(),
          routineService.getUserHabits(),
        ]);

        // 1. Process server habit definitions
        let loadedHabits = DEFAULT_HABITS;
        const activeIds = new Set<string>();

        if (serverHabitsRes.status === 'fulfilled' && serverHabitsRes.value.length > 0) {
          const seen = new Set<string>();
          const deduped: HabitItem[] = [];
          for (const h of serverHabitsRes.value) {
            const key = h.name.trim().toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(h);
              if (h.enabled !== false) {
                activeIds.add(h.id);
              }
            }
          }
          loadedHabits = deduped;
        } else {
          activeIds.add('workout');
          activeIds.add('meditation');
        }
        setHabits(loadedHabits);

        // 2. Process today's saved routine (if exists)
        if (todayRoutineRes.status === 'fulfilled' && todayRoutineRes.value) {
          const r = todayRoutineRes.value;
          setIsExistingRoutine(true);

          if (r.wakeUpTime) {
            setTodayWakeUpTime(r.wakeUpTime);
          }
          if (r.waterIntake !== undefined) {
            setTodayWaterLogged(r.waterIntake);
          }
          if (r.studyHours !== undefined) {
            setTodayStudyLogged(r.studyHours);
          }

          if (r.activities && r.activities.length > 0) {
            const compMap: Record<string, boolean | string | number> = {};
            r.activities.forEach((act) => {
              const id = act.activityId || act.name;
              compMap[id] = act.value;
              compMap[act.name] = act.value;
              // If the routine actively includes this habit, select it
              activeIds.add(id);
            });
            setExistingCompletionMap(compMap);
          }
        }

        setSelectedHabitIds(activeIds);
      } catch {
        // Safe fallback
      } finally {
        setInitialLoading(false);
      }
    }

    loadDefaults();
  }, []);

  // Habit Selection Toggle
  const toggleHabit = (id: string) => {
    triggerHaptic('light');
    setSelectedHabitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add Custom Habit Handler
  const handleAddCustomHabit = async () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) {
      setToast({ visible: true, type: 'error', message: 'Please enter a habit name.' });
      triggerHaptic('warning');
      return;
    }
    if (trimmed.length < 2) {
      setToast({ visible: true, type: 'error', message: 'Habit name must be at least 2 characters.' });
      triggerHaptic('warning');
      return;
    }
    const lower = trimmed.toLowerCase();
    if (habits.some((h) => h.name.trim().toLowerCase() === lower)) {
      setToast({ visible: true, type: 'error', message: `"${trimmed}" already exists.` });
      triggerHaptic('warning');
      return;
    }

    setAddingHabitLoading(true);
    triggerHaptic('light');

    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      name: trimmed,
      type: 'boolean',
      enabled: true,
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    setSelectedHabitIds((prev) => new Set([...prev, newHabit.id]));

    try {
      await routineService.updateUserHabits(updatedHabits);
      triggerHaptic('success');
      setToast({ visible: true, type: 'success', message: `Habit "${trimmed}" added!` });
      setNewHabitName('');
      setIsAddingHabit(false);
    } catch {
      setToast({ visible: true, type: 'error', message: 'Could not sync habit to server.' });
      triggerHaptic('warning');
    } finally {
      setAddingHabitLoading(false);
    }
  };

  // Delete Habit Handler
  const handleDeleteHabit = (habit: HabitItem) => {
    triggerHaptic('warning');

    const performDelete = async () => {
      const updatedHabits = habits.filter((h) => h.id !== habit.id);
      setHabits(updatedHabits);
      setSelectedHabitIds((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });

      try {
        await routineService.updateUserHabits(updatedHabits);
        triggerHaptic('success');
        setToast({ visible: true, type: 'success', message: `Habit "${habit.name}" removed.` });
      } catch {
        setToast({ visible: true, type: 'error', message: 'Could not remove habit from server.' });
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Remove "${habit.name}" from your active habits?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Remove Habit',
        `Are you sure you want to remove "${habit.name}" from your active habits?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // Save All Changes (Syncs Habits and Today's Routine)
  const handleSave = async () => {
    triggerHaptic('light');
    setLoading(true);
    setToast(null);

    // 1. Sync updated habit preferences to profile
    const syncedHabits = habits.map((h) => ({
      ...h,
      enabled: selectedHabitIds.has(h.id),
    }));

    // 2. Prepare today's routine activities with existing completion preserved
    const activities: RoutineActivity[] = habits
      .filter((h) => selectedHabitIds.has(h.id))
      .map((h) => ({
        activityId: h.id,
        name: h.name,
        value: existingCompletionMap[h.id] ?? existingCompletionMap[h.name] ?? false,
      }));

    try {
      if (__DEV__) {
        console.log('⚙️ [ADD ROUTINE] 1/2 Persisting updated habits...');
      }

      // Step 1: Save updated habit list
      await routineService.updateUserHabits(syncedHabits);

      if (__DEV__) {
        console.log('💾 [ADD ROUTINE] 2/2 Saving routine with selected habits...');
      }

      // Step 2: Save the routine activities for today
      await routineService.saveRoutine({
        date: getTodayDateString(),
        wakeUpTime: todayWakeUpTime || undefined,
        waterIntake: todayWaterLogged,
        studyHours: todayStudyLogged,
        activities,
      });

      triggerHaptic('success');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/today');
      }
    } catch (err: unknown) {
      if (__DEV__) {
        console.error('❌ [ADD ROUTINE ERROR]', err);
      }
      const msg = err instanceof Error ? err.message : 'Could not save routine. Please try again.';
      setToast({ visible: true, type: 'error', message: msg });
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const previewMeta = getHabitBrandMeta(newHabitName || 'Custom Habit', theme.isDark);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Screen Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.topBarInner, { maxWidth: containerMaxWidth }]}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/today');
              }
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <View
            style={[
              styles.datePill,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.dateBadgeText, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: containerMaxWidth,
              paddingBottom: Math.max(insets.bottom + 36, 44),
              paddingLeft: insets.left + horizontalPadding,
              paddingRight: insets.right + horizontalPadding,
            },
          ]}>
          {/* Header Title Section */}
          <View style={styles.header}>
            <Text
              style={[
                styles.eyebrow,
                {
                  color: theme.isDark
                    ? PrimitiveTokens.color.amber[400]
                    : PrimitiveTokens.color.amber[700],
                },
              ]}>
              HABITS MANAGEMENT
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isExistingRoutine ? 'Manage Habits' : 'Set Up Daily Habits'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Select which habits to track today or create new custom ones.
            </Text>
          </View>

          {initialLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loaderText, { color: theme.colors.textSecondary }]}>
                Loading rhythm settings...
              </Text>
            </View>
          ) : (
            <>
              {/* ========================================================
                  FOCUS HABITS MANAGEMENT
                  ======================================================== */}
              <View style={[styles.sectionHeadingRow, { marginTop: PrimitiveTokens.space[1] }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupLabel, { color: theme.colors.textSecondary, marginBottom: 0 }]}>
                    FOCUS HABITS
                  </Text>
                  <Text style={[styles.sectionSubtitleHint, { color: theme.colors.textMuted }]}>
                    Toggle habits you want to track today, or add custom ones.
                  </Text>
                </View>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor:
                        selectedHabitIds.size > 0
                          ? theme.isDark
                            ? 'rgba(30, 158, 90, 0.2)'
                            : '#E3F3E9'
                          : theme.colors.surfaceAlt,
                      borderColor:
                        selectedHabitIds.size > 0
                          ? theme.isDark
                            ? 'rgba(91, 219, 139, 0.4)'
                            : PrimitiveTokens.color.fern[200]
                          : theme.colors.borderSubtle,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      {
                        color:
                          selectedHabitIds.size > 0
                            ? theme.colors.success
                            : theme.colors.textMuted,
                      },
                    ]}>
                    {selectedHabitIds.size} ACTIVE
                  </Text>
                </View>
              </View>

              <Card style={styles.groupedCard}>
                {habits.map((habit, index) => {
                  const isSelected = selectedHabitIds.has(habit.id);
                  const isLast = index === habits.length - 1 && !isAddingHabit;
                  const meta = getHabitBrandMeta(habit.name, theme.isDark);

                  return (
                    <React.Fragment key={habit.id}>
                      <Pressable
                        onPress={() => toggleHabit(habit.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${habit.name}, ${isSelected ? 'active' : 'inactive'}`}
                        style={({ pressed }) => [
                          styles.habitRow,
                          pressed && { opacity: 0.75 },
                        ]}>
                        <View style={styles.habitLeft}>
                          {/* Habit Icon Circle */}
                          <View
                            style={[
                              styles.habitIconCircle,
                              { backgroundColor: meta.tileBg },
                            ]}>
                            <Ionicons name={meta.icon} size={18} color={meta.iconColor} />
                          </View>

                          {/* Habit Name */}
                          <Text
                            style={[
                              styles.habitRowName,
                              {
                                color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                            numberOfLines={1}>
                            {habit.name}
                          </Text>
                        </View>

                        {/* Right Actions: Delete icon + Checkbox */}
                        <View style={styles.habitRightActions}>
                          <Pressable
                            onPress={() => handleDeleteHabit(habit)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={`Delete ${habit.name}`}
                            style={({ pressed }) => [
                              styles.trashBtn,
                              pressed && { opacity: 0.6 },
                            ]}>
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color={theme.colors.textMuted}
                            />
                          </Pressable>

                          {/* Checkbox indicator */}
                          {isSelected ? (
                            <View
                              style={[
                                styles.checkFilledCircle,
                                { backgroundColor: theme.colors.success },
                              ]}>
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.checkEmptyCircle,
                                { borderColor: theme.colors.border },
                              ]}
                            />
                          )}
                        </View>
                      </Pressable>

                      {!isLast && (
                        <View
                          style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Inline Add Custom Habit Expansion */}
                {isAddingHabit ? (
                  <View
                    style={[
                      styles.addHabitExpanded,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderTopColor: theme.colors.borderSubtle,
                      },
                    ]}>
                    <Text style={[styles.addHabitPrompt, { color: theme.colors.text }]}>
                      New Habit Name
                    </Text>

                    <View
                      style={[
                        styles.addHabitInputWrapper,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}>
                      <Ionicons
                        name={previewMeta.icon}
                        size={17}
                        color={previewMeta.iconColor}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        value={newHabitName}
                        onChangeText={setNewHabitName}
                        placeholder="e.g. Morning Walk, Journal, Cold Shower"
                        placeholderTextColor={theme.colors.textMuted}
                        style={[styles.habitTextInput, { color: theme.colors.text }]}
                        autoFocus
                        maxLength={40}
                        returnKeyType="done"
                        onSubmitEditing={handleAddCustomHabit}
                      />
                    </View>

                    {newHabitName.trim().length > 0 && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: theme.colors.textMuted }]}>
                          Preview:
                        </Text>
                        <View
                          style={[
                            styles.previewPill,
                            { backgroundColor: previewMeta.tileBg },
                          ]}>
                          <Ionicons
                            name={previewMeta.icon}
                            size={13}
                            color={previewMeta.iconColor}
                          />
                          <Text
                            style={[
                              styles.previewPillText,
                              { color: previewMeta.iconColor },
                            ]}>
                            {newHabitName.trim()}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.addHabitActions}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic('light');
                          setIsAddingHabit(false);
                          setNewHabitName('');
                        }}
                        style={({ pressed }) => [
                          styles.cancelAddBtn,
                          { borderColor: theme.colors.border },
                          pressed && { opacity: 0.7 },
                        ]}>
                        <Text style={[styles.cancelAddText, { color: theme.colors.textSecondary }]}>
                          Cancel
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={handleAddCustomHabit}
                        disabled={addingHabitLoading || newHabitName.trim().length === 0}
                        style={({ pressed }) => [
                          styles.confirmAddBtn,
                          {
                            backgroundColor:
                              newHabitName.trim().length > 0
                                ? theme.colors.primary
                                : theme.colors.borderSubtle,
                          },
                          pressed && { opacity: 0.8 },
                        ]}>
                        {addingHabitLoading ? (
                          <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
                        ) : (
                          <>
                            <Ionicons
                              name="add"
                              size={16}
                              color={
                                newHabitName.trim().length > 0
                                  ? theme.colors.primaryForeground
                                  : theme.colors.textMuted
                              }
                            />
                            <Text
                              style={[
                                styles.confirmAddText,
                                {
                                  color:
                                    newHabitName.trim().length > 0
                                      ? theme.colors.primaryForeground
                                      : theme.colors.textMuted,
                                },
                              ]}>
                              Add Habit
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <View
                      style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]}
                    />
                    <Pressable
                      onPress={() => {
                        triggerHaptic('light');
                        setIsAddingHabit(true);
                      }}
                      style={({ pressed }) => [
                        styles.addHabitTriggerRow,
                        pressed && { opacity: 0.75 },
                      ]}>
                      <View
                        style={[
                          styles.addHabitTriggerIcon,
                          {
                            backgroundColor: theme.isDark
                              ? 'rgba(30, 158, 90, 0.2)'
                              : '#E3F3E9',
                          },
                        ]}>
                        <Ionicons
                          name="add"
                          size={18}
                          color={theme.colors.success}
                        />
                      </View>
                      <Text
                        style={[
                          styles.addHabitTriggerText,
                          { color: theme.colors.success },
                        ]}>
                        Add Custom Habit
                      </Text>
                    </Pressable>
                  </>
                )}
              </Card>

              {/* Profile Target Info Banner */}
              <Card
                style={[
                  styles.targetBannerCard,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(251, 191, 36, 0.08)'
                      : 'rgba(251, 191, 36, 0.12)',
                    borderColor: theme.isDark
                      ? 'rgba(251, 191, 36, 0.25)'
                      : PrimitiveTokens.color.amber[200],
                  },
                ]}>
                <View style={styles.targetBannerContent}>
                  <View
                    style={[
                      styles.targetBannerIconCircle,
                      {
                        backgroundColor: theme.isDark
                          ? SemanticDarkTokens.color.bg.tileAmber
                          : SemanticLightTokens.color.bg.tileAmber,
                      },
                    ]}>
                    <Ionicons
                      name="flag"
                      size={18}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.amber[400]
                          : PrimitiveTokens.color.amber[700]
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.targetBannerTitle, { color: theme.colors.text }]}>
                      Looking for Daily Targets?
                    </Text>
                    <Text
                      style={[
                        styles.targetBannerDesc,
                        { color: theme.colors.textSecondary },
                      ]}>
                      Your benchmark targets for Wake-up, Water, and Study are configured in Profile Settings.
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    router.push('/(tabs)/profile');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open Target Settings in Profile"
                  style={({ pressed }) => [
                    styles.targetBannerBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSubtle,
                    },
                    pressed && { opacity: 0.75 },
                  ]}>
                  <Text style={[styles.targetBannerBtnText, { color: theme.colors.text }]}>
                    Open Target Settings in Profile
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.colors.text} />
                </Pressable>
              </Card>

              {/* Clean CTA Save Button */}
              <View style={{ marginTop: PrimitiveTokens.space[6] }}>
                <Button
                  title="Save Habits"
                  onPress={handleSave}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  pill
                  fullWidth
                  icon={
                    <Ionicons
                      name="checkmark-sharp"
                      size={18}
                      color={theme.colors.primaryForeground}
                      style={{ marginRight: 6 }}
                    />
                  }
                  style={styles.saveBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    zIndex: 10,
    height: 52,
    justifyContent: 'center',
  },
  topBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  datePill: {
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  dateBadgeText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: PrimitiveTokens.space[3],
  },
  header: {
    marginBottom: PrimitiveTokens.space[5],
  },
  eyebrow: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: PrimitiveTokens.space[1],
  },
  title: {
    fontSize: TypographyScale.h2.fontSize,
    fontFamily: TypographyScale.h2.fontFamily,
    fontWeight: TypographyScale.h2.fontWeight,
    letterSpacing: TypographyScale.h2.letterSpacing,
  },
  subtitle: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    lineHeight: TypographyScale.bodySm.lineHeight,
    marginTop: PrimitiveTokens.space[1],
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: PrimitiveTokens.space[3],
  },
  loaderText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
  },
  groupLabel: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  sectionSubtitleHint: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 2,
    marginBottom: PrimitiveTokens.space[1],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: PrimitiveTokens.space[5],
    marginBottom: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  countBadge: {
    paddingHorizontal: PrimitiveTokens.space[2],
    paddingVertical: PrimitiveTokens.space['0_5'],
    borderRadius: PrimitiveTokens.radius.sm,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupedCard: {
    padding: PrimitiveTokens.space['0_5'],
    borderRadius: PrimitiveTokens.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PrimitiveTokens.space['3_5'],
    paddingVertical: PrimitiveTokens.space[3],
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: PrimitiveTokens.space[3],
  },
  targetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInfo: {
    flex: 1,
  },
  targetTitle: {
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
    fontWeight: '700',
  },
  targetSubtitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[2],
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontWeight: '700',
    minWidth: 54,
    textAlign: 'center',
  },
  resetBtn: {
    paddingHorizontal: PrimitiveTokens.space[2],
    paddingVertical: PrimitiveTokens.space[1],
    borderRadius: PrimitiveTokens.radius.md,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  logNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  logNowText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: PrimitiveTokens.space['3_5'],
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PrimitiveTokens.space['3_5'],
    paddingVertical: PrimitiveTokens.space[3],
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: PrimitiveTokens.space[3],
  },
  habitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitRowName: {
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
    flex: 1,
  },
  habitRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
  },
  trashBtn: {
    padding: PrimitiveTokens.space[1],
  },
  checkFilledCircle: {
    width: 24,
    height: 24,
    borderRadius: PrimitiveTokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmptyCircle: {
    width: 24,
    height: 24,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  /* Add custom habit trigger row */
  addHabitTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    paddingHorizontal: PrimitiveTokens.space['3_5'],
    paddingVertical: PrimitiveTokens.space[3],
  },
  addHabitTriggerIcon: {
    width: 38,
    height: 38,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHabitTriggerText: {
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
    fontWeight: '700',
  },
  /* Add habit expanded form */
  addHabitExpanded: {
    padding: PrimitiveTokens.space['3_5'],
    borderTopWidth: 1,
  },
  addHabitPrompt: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: PrimitiveTokens.space[2],
  },
  addHabitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: PrimitiveTokens.radius.lg,
    borderWidth: 1,
    paddingHorizontal: PrimitiveTokens.space[3],
  },
  habitTextInput: {
    flex: 1,
    height: '100%',
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[2],
    marginTop: PrimitiveTokens.space[2],
  },
  previewLabel: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
    paddingHorizontal: PrimitiveTokens.space[2],
    paddingVertical: PrimitiveTokens.space['0_5'],
    borderRadius: PrimitiveTokens.radius.full,
  },
  previewPillText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  addHabitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: PrimitiveTokens.space[2],
    marginTop: PrimitiveTokens.space[3],
  },
  cancelAddBtn: {
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space[2],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  cancelAddText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '600',
  },
  confirmAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
    paddingHorizontal: PrimitiveTokens.space[4],
    paddingVertical: PrimitiveTokens.space[2],
    borderRadius: PrimitiveTokens.radius.full,
  },
  confirmAddText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: PrimitiveTokens.space[6],
  },
  targetBannerCard: {
    marginTop: PrimitiveTokens.space[6],
    borderRadius: PrimitiveTokens.radius.xl,
    padding: PrimitiveTokens.space[4],
    borderWidth: 1,
  },
  targetBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
  },
  targetBannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBannerTitle: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '700',
    marginBottom: 2,
  },
  targetBannerDesc: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    lineHeight: 16,
  },
  targetBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space[1],
    paddingVertical: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[3],
    borderRadius: PrimitiveTokens.radius.md,
    borderWidth: 1,
    marginTop: PrimitiveTokens.space[3],
  },
  targetBannerBtnText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '600',
  },
});
