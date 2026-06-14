import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector } from '../../src/hooks/useAppStore';
import { Card } from '../../src/components/common/Card';
import { StatBadge } from '../../src/components/common/StatBadge';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { formatDuration, formatDate, formatTime, formatVolume, formatWeight } from '../../src/utils/formatters';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAppSelector(s => s.workouts.sessions.find(w => w.id === id));

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Workout not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {session.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta */}
        <Animated.View entering={FadeInDown.delay(0).duration(350)}>
          <View style={styles.meta}>
            <Text style={styles.dateText}>{formatDate(session.date)}</Text>
            <Text style={styles.timeText}>
              {formatTime(session.startTime)}
              {session.endTime ? ` – ${formatTime(session.endTime)}` : ''}
            </Text>
          </View>
          {session.location?.address && (
            <Text style={styles.location}>📍 {session.location.address}</Text>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <View style={styles.statsRow}>
            <StatBadge label="Duration" value={formatDuration(session.duration ?? 0)} color={Colors.primary} />
            <StatBadge label="Exercises" value={String(session.exercises.length)} color={Colors.accent} />
            <StatBadge label={`Sets`} value={`${completedSets}/${totalSets}`} color={Colors.secondary} />
            {(session.totalVolume ?? 0) > 0 && (
              <StatBadge label="Volume" value={formatVolume(session.totalVolume ?? 0)} color={Colors.primaryLight} />
            )}
          </View>
        </Animated.View>

        {/* Exercises */}
        {session.exercises.map((ex, idx) => (
          <Animated.View key={ex.id} entering={FadeInDown.delay(120 + idx * 60).duration(350)}>
            <Card style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
              <Text style={styles.muscleGroups}>
                {ex.exercise.muscleGroups.join(' · ')}
              </Text>

              {/* Set rows */}
              <View style={styles.setsTable}>
                <View style={styles.setsHeader}>
                  <Text style={[styles.setsHeaderCell, { flex: 0.5 }]}>Set</Text>
                  {ex.exercise.category === 'cardio' ? (
                    <Text style={styles.setsHeaderCell}>Duration</Text>
                  ) : (
                    <>
                      <Text style={styles.setsHeaderCell}>Weight</Text>
                      <Text style={styles.setsHeaderCell}>Reps</Text>
                      <Text style={styles.setsHeaderCell}>Vol.</Text>
                    </>
                  )}
                  <Text style={[styles.setsHeaderCell, { flex: 0.5 }]}>✓</Text>
                </View>
                {ex.sets.map((set, si) => (
                  <View
                    key={set.id}
                    style={[styles.setRow, set.completed && styles.setRowCompleted]}
                  >
                    <Text style={[styles.setCell, { flex: 0.5 }]}>{si + 1}</Text>
                    {ex.exercise.category === 'cardio' ? (
                      <Text style={styles.setCell}>
                        {set.duration ? formatDuration(set.duration) : '—'}
                      </Text>
                    ) : (
                      <>
                        <Text style={styles.setCell}>{formatWeight(set.weight ?? 0)}</Text>
                        <Text style={styles.setCell}>{set.reps ?? '—'}</Text>
                        <Text style={styles.setCell}>
                          {set.weight && set.reps
                            ? `${set.weight * set.reps} kg`
                            : '—'}
                        </Text>
                      </>
                    )}
                    <Text style={[styles.setCell, { flex: 0.5, color: set.completed ? Colors.secondary : Colors.text.muted }]}>
                      {set.completed ? '✓' : '○'}
                    </Text>
                  </View>
                ))}
              </View>

              {ex.notes && <Text style={styles.notes}>Note: {ex.notes}</Text>}
            </Card>
          </Animated.View>
        ))}

        {session.notes && (
          <Animated.View entering={FadeInDown.delay(300).duration(350)}>
            <Card>
              <Text style={styles.notesTitle}>Workout Notes</Text>
              <Text style={styles.notesBody}>{session.notes}</Text>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.lg, color: Colors.text.secondary },
  backLink: { fontSize: FontSize.md, color: Colors.primary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: FontWeight.bold },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },

  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  meta: { gap: 2 },
  dateText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  timeText: { fontSize: FontSize.md, color: Colors.text.secondary },
  location: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: Spacing.xs },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },

  exerciseCard: { gap: Spacing.sm },
  exerciseName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  muscleGroups: { fontSize: FontSize.sm, color: Colors.primary },

  setsTable: { gap: 2 },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setsHeaderCell: { flex: 1, fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', textTransform: 'uppercase' },
  setRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  setRowCompleted: { backgroundColor: Colors.secondary + '12' },
  setCell: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    textAlign: 'center',
  },

  notes: { fontSize: FontSize.sm, color: Colors.text.secondary, fontStyle: 'italic' },
  notesTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: Spacing.xs },
  notesBody: { fontSize: FontSize.md, color: Colors.text.secondary, lineHeight: 22 },
});
