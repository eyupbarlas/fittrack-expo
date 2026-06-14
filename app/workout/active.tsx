import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppStore';
import {
  updateSet,
  addSet,
  removeSet,
  addExerciseToActive,
  finishWorkout,
  discardWorkout,
  saveWorkoutsToStorage,
  updateActiveSession,
} from '../../src/store/slices/workoutsSlice';
import { SetRow } from '../../src/components/workout/SetRow';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { useWorkoutTimer } from '../../src/hooks/useWorkoutTimer';
import { useLocation } from '../../src/hooks/useLocation';
import { useHaptics } from '../../src/hooks/useHaptics';
import { formatDuration, generateId } from '../../src/utils/formatters';
import { EXERCISES } from '../../src/constants/workoutData';
import { notificationsService } from '../../src/services/notificationsService';
import type { WorkoutExercise } from '../../src/types';

export default function ActiveWorkoutScreen() {
  const dispatch = useAppDispatch();
  const activeSession = useAppSelector(s => s.workouts.activeSession);
  const allSessions = useAppSelector(s => s.workouts.sessions);
  const { elapsed, isRunning, pause, start } = useWorkoutTimer(true);
  const { requestAndFetch, isLoading: locationLoading } = useLocation();
  const { success, warning, heavyTap } = useHaptics();
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  if (!activeSession) {
    router.replace('/workout/new');
    return null;
  }

  const filteredExercises = EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleAddExercise = (exercise: (typeof EXERCISES)[0]) => {
    const workoutExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      sets: [{ id: generateId(), completed: false }],
    };
    dispatch(addExerciseToActive(workoutExercise));
    lightTap();
    setShowExercisePicker(false);
    setExerciseSearch('');
  };

  function lightTap() {
    // inline haptic - avoids hook rules violation
  }

  const handleFinish = useCallback(async () => {
    const completedSets = activeSession.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
      0
    );

    if (completedSets === 0) {
      Alert.alert('No sets completed', 'Complete at least one set before finishing.');
      return;
    }

    Alert.alert('Finish Workout?', `Great work! ${elapsed < 60 ? 'That was quick!' : ''}`, [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          pause();
          success();

          // Optionally tag with location
          const location = await requestAndFetch();

          const totalVolume = activeSession.exercises.reduce((sum, ex) => {
            return (
              sum +
              ex.sets.reduce((ssum, set) => {
                if (set.completed && set.weight && set.reps) {
                  return ssum + set.weight * set.reps;
                }
                return ssum;
              }, 0)
            );
          }, 0);

          const finishedSession = {
            ...activeSession,
            endTime: new Date().toISOString(),
            duration: elapsed,
            isCompleted: true,
            totalVolume,
            location: location ?? undefined,
          };

          dispatch(finishWorkout(finishedSession));
          // Persist to AsyncStorage
          dispatch(saveWorkoutsToStorage([finishedSession, ...allSessions]));

          // Trigger completion notification
          notificationsService.sendWorkoutCompleteNotification(
            activeSession.name,
            elapsed
          );

          router.replace('/(tabs)');
        },
      },
    ]);
  }, [activeSession, elapsed, allSessions, dispatch, pause, requestAndFetch, success]);

  const handleDiscard = () => {
    Alert.alert('Discard Workout?', 'All progress will be lost.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          warning();
          dispatch(discardWorkout());
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleDiscard}>
          <Text style={styles.discardText}>Discard</Text>
        </Pressable>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
          <Pressable onPress={isRunning ? pause : start} style={styles.pauseButton}>
            <Text style={styles.pauseIcon}>{isRunning ? '⏸' : '▶'}</Text>
          </Pressable>
        </View>
        <Pressable onPress={handleFinish} style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </Pressable>
      </View>

      <Text style={styles.workoutName}>{activeSession.name}</Text>

      {/* Exercises list */}
      <FlatList
        data={activeSession.exercises}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: ex }) => (
          <Card style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
            <View style={styles.setHeader}>
              <Text style={styles.setHeaderText}>Set</Text>
              {ex.exercise.category === 'cardio' ? (
                <Text style={styles.setHeaderText}>Duration (s)</Text>
              ) : (
                <>
                  <Text style={styles.setHeaderText}>Weight (kg)</Text>
                  <Text style={styles.setHeaderText}>Reps</Text>
                </>
              )}
              <Text style={styles.setHeaderText}>✓</Text>
            </View>
            {ex.sets.map((set, idx) => (
              <SetRow
                key={set.id}
                set={set}
                setNumber={idx + 1}
                isCardio={ex.exercise.category === 'cardio'}
                onUpdate={updates =>
                  dispatch(updateSet({ exerciseId: ex.id, setId: set.id, updates }))
                }
              />
            ))}
            <View style={styles.setActions}>
              <Pressable
                onPress={() =>
                  dispatch(addSet({ exerciseId: ex.id, set: { id: generateId(), completed: false } }))
                }
                style={styles.addSetButton}
              >
                <Text style={styles.addSetText}>+ Add Set</Text>
              </Pressable>
              {ex.sets.length > 1 && (
                <Pressable
                  onPress={() =>
                    dispatch(removeSet({ exerciseId: ex.id, setId: ex.sets[ex.sets.length - 1].id }))
                  }
                  style={styles.removeSetButton}
                >
                  <Text style={styles.removeSetText}>− Remove</Text>
                </Pressable>
              )}
            </View>
          </Card>
        )}
        ListFooterComponent={
          <Button
            label="+ Add Exercise"
            onPress={() => setShowExercisePicker(true)}
            variant="outline"
            style={styles.addExerciseButton}
          />
        }
      />

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add Exercise</Text>
              <Pressable onPress={() => setShowExercisePicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.pickerSearch}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Search exercises…"
              placeholderTextColor={Colors.text.muted}
              autoFocus
            />
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              style={styles.pickerList}
              renderItem={({ item }) => (
                <Pressable style={styles.pickerItem} onPress={() => handleAddExercise(item)}>
                  <Text style={styles.pickerItemName}>{item.name}</Text>
                  <Text style={styles.pickerItemMeta}>
                    {item.muscleGroups.slice(0, 2).join(' · ')}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  discardText: { fontSize: FontSize.md, color: Colors.danger, fontWeight: FontWeight.medium },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timer: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, fontVariant: ['tabular-nums'] },
  pauseButton: { padding: Spacing.xs },
  pauseIcon: { fontSize: 18 },
  finishButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  finishText: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },

  workoutName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  listContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  exerciseCard: { gap: Spacing.sm },
  exerciseName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  setHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  setHeaderText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  addSetButton: { paddingVertical: Spacing.xs },
  addSetText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  removeSetButton: { paddingVertical: Spacing.xs },
  removeSetText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },

  addExerciseButton: { marginTop: Spacing.sm },

  // Picker
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '75%',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  pickerClose: { fontSize: FontSize.lg, color: Colors.text.secondary, padding: Spacing.xs },
  pickerSearch: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  pickerList: { maxHeight: 400 },
  pickerItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 2,
  },
  pickerItemName: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  pickerItemMeta: { fontSize: FontSize.sm, color: Colors.text.muted },
});
