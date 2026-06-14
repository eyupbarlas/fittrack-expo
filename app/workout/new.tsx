import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch } from '../../src/hooks/useAppStore';
import { startWorkout } from '../../src/store/slices/workoutsSlice';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { WORKOUT_TEMPLATES, CATEGORY_LABELS } from '../../src/constants/workoutData';
import { generateId } from '../../src/utils/formatters';
import { useHaptics } from '../../src/hooks/useHaptics';
import type { WorkoutSession, WorkoutTemplate } from '../../src/types';

export default function NewWorkoutScreen() {
  const dispatch = useAppDispatch();
  const { success, lightTap } = useHaptics();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    lightTap();
    setSelectedTemplate(prev => (prev?.id === template.id ? null : template));
    if (!workoutName) setWorkoutName(template.name);
  };

  const handleStart = () => {
    const name = workoutName.trim() || (selectedTemplate?.name ?? 'Workout');
    const now = new Date().toISOString();

    const session: WorkoutSession = {
      id: generateId(),
      name,
      date: now,
      startTime: now,
      exercises: selectedTemplate
        ? selectedTemplate.exercises.map(te => ({
            id: generateId(),
            exercise: te.exercise,
            sets: Array.from({ length: te.defaultSets }, () => ({
              id: generateId(),
              weight: te.defaultWeight,
              reps: te.defaultReps,
              duration: te.defaultDuration,
              completed: false,
            })),
          }))
        : [],
      isCompleted: false,
    };

    dispatch(startWorkout(session));
    success();
    router.replace('/workout/active');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>New Workout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout name */}
        <View>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="e.g. Push Day, Morning Run…"
            placeholderTextColor={Colors.text.muted}
          />
        </View>

        {/* Templates */}
        <Text style={styles.sectionTitle}>Choose a Template</Text>
        <Text style={styles.sectionSubtitle}>
          Pick a template to pre-fill exercises, or start blank.
        </Text>

        {WORKOUT_TEMPLATES.map(template => (
          <Pressable key={template.id} onPress={() => handleSelectTemplate(template)}>
            <Card
              style={[
                styles.templateCard,
                selectedTemplate?.id === template.id && styles.templateSelected,
              ]}
            >
              <View style={styles.templateHeader}>
                <View style={styles.templateTitleRow}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{template.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.templateCategory}>
                  {CATEGORY_LABELS[template.category]} · ~{template.estimatedDuration} min
                </Text>
              </View>
              <Text style={styles.templateDescription}>{template.description}</Text>
              <Text style={styles.templateExercises}>
                {template.exercises.length} exercises ·{' '}
                {template.muscleGroups.slice(0, 3).join(', ')}
              </Text>
              {selectedTemplate?.id === template.id && (
                <Text style={styles.selectedMark}>✓ Selected</Text>
              )}
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={selectedTemplate ? `Start: ${selectedTemplate.name}` : 'Start Blank Workout'}
          onPress={handleStart}
          size="lg"
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
  },
  closeText: { color: Colors.text.primary, fontSize: FontSize.md },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },

  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  label: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: Spacing.xs },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  sectionSubtitle: { fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: -Spacing.sm },

  templateCard: { gap: Spacing.sm },
  templateSelected: { borderColor: Colors.primary, borderWidth: 2 },
  templateHeader: { gap: 2 },
  templateTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  templateName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, flex: 1 },
  difficultyBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  difficultyText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: FontWeight.semibold },
  templateCategory: { fontSize: FontSize.sm, color: Colors.text.muted },
  templateDescription: { fontSize: FontSize.sm, color: Colors.text.secondary },
  templateExercises: { fontSize: FontSize.xs, color: Colors.text.muted },
  selectedMark: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.bold },

  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: { borderRadius: BorderRadius.lg },
});
