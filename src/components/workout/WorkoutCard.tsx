import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import { formatDuration, formatDate, formatVolume } from '../../utils/formatters';
import type { WorkoutSession } from '../../types';
import { useHaptics } from '../../hooks/useHaptics';

interface WorkoutCardProps {
  session: WorkoutSession;
  onPress: () => void;
  onDelete: (id: string) => void;
}

const DELETE_THRESHOLD = -80;

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ session, onPress, onDelete }) => {
  const { warning, success } = useHaptics();
  const translateX = useSharedValue(0);
  const cardHeight = useSharedValue(1); // scale for collapse animation after delete

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Workout', `Remove "${session.name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel', onPress: () => { translateX.value = withSpring(0); } },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          warning();
          // Animate card collapsing before removing from list
          cardHeight.value = withTiming(0, { duration: 250 }, () => {
            runOnJS(onDelete)(session.id);
          });
        },
      },
    ]);
  }, [session.id, session.name, onDelete, translateX, cardHeight, warning]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      // Only allow swiping left (negative x), cap at -120
      translateX.value = Math.max(Math.min(e.translationX, 0), -120);
    })
    .onEnd(e => {
      if (e.translationX < DELETE_THRESHOLD) {
        // Snap to reveal delete zone
        translateX.value = withSpring(-100);
        runOnJS(warning)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (translateX.value < -10) {
      // If swiped open, close it instead of opening detail
      translateX.value = withSpring(0);
    } else {
      runOnJS(onPress)();
      runOnJS(success)();
    }
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -20], [1, 0], Extrapolation.CLAMP),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: cardHeight.value === 1 ? undefined : cardHeight.value * 120,
    opacity: cardHeight.value,
    marginBottom: cardHeight.value === 1 ? Spacing.md : cardHeight.value * Spacing.md,
    overflow: 'hidden',
  }));

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
    0
  );

  return (
    <Animated.View style={containerStyle}>
      {/* Delete background revealed by swipe */}
      <Animated.View style={[styles.deleteBackground, deleteStyle]}>
        <Text style={styles.deleteIcon}>🗑️</Text>
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>{session.name}</Text>
              {session.isCompleted && <Text style={styles.completedBadge}>✓ Done</Text>}
            </View>
            <Text style={styles.date}>{formatDate(session.date)}</Text>
          </View>

          <View style={styles.stats}>
            <StatItem label="Duration" value={formatDuration(session.duration ?? 0)} />
            <StatItem label="Exercises" value={String(session.exercises.length)} />
            <StatItem label="Sets" value={`${completedSets}/${totalSets}`} />
            {(session.totalVolume ?? 0) > 0 && (
              <StatItem label="Volume" value={formatVolume(session.totalVolume ?? 0)} />
            )}
          </View>

          {session.location?.address && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {session.location.address}
            </Text>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteIcon: { fontSize: 22 },
  deleteText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: { gap: 2 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  completedBadge: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: FontWeight.semibold,
  },
  date: { fontSize: FontSize.sm, color: Colors.text.secondary },

  stats: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  statItem: { alignItems: 'center', minWidth: 56 },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted },

  location: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
});
