import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import type { WorkoutSet } from '../../types';
import { useHaptics } from '../../hooks/useHaptics';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  isCardio?: boolean;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
}

export const SetRow: React.FC<SetRowProps> = ({ set, setNumber, isCardio = false, onUpdate }) => {
  const { lightTap, success } = useHaptics();
  const [weight, setWeight] = useState(set.weight?.toString() ?? '');
  const [reps, setReps] = useState(set.reps?.toString() ?? '');
  const [duration, setDuration] = useState(set.duration?.toString() ?? '');

  const checkScale = useSharedValue(1);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggleComplete = () => {
    const newCompleted = !set.completed;
    if (newCompleted) {
      success();
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 6 }),
        withSpring(1, { damping: 8 })
      );
    } else {
      lightTap();
    }

    onUpdate({
      completed: newCompleted,
      weight: weight ? parseFloat(weight) : undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      duration: duration ? parseInt(duration, 10) : undefined,
    });
  };

  return (
    <View style={[styles.row, set.completed && styles.completedRow]}>
      <Text style={styles.setNumber}>{setNumber}</Text>

      {isCardio ? (
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="sec"
          placeholderTextColor={Colors.text.muted}
          keyboardType="numeric"
          onBlur={() => onUpdate({ duration: duration ? parseInt(duration, 10) : undefined })}
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="kg"
            placeholderTextColor={Colors.text.muted}
            keyboardType="decimal-pad"
            onBlur={() => onUpdate({ weight: weight ? parseFloat(weight) : undefined })}
          />
          <Text style={styles.separator}>×</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="reps"
            placeholderTextColor={Colors.text.muted}
            keyboardType="numeric"
            onBlur={() => onUpdate({ reps: reps ? parseInt(reps, 10) : undefined })}
          />
        </>
      )}

      <Pressable onPress={handleToggleComplete} hitSlop={8}>
        <Animated.View style={[styles.checkButton, set.completed && styles.checkButtonDone, checkStyle]}>
          {set.completed && <Text style={styles.checkMark}>✓</Text>}
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  completedRow: {
    backgroundColor: Colors.secondary + '15',
  },
  setNumber: {
    width: 24,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  separator: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDone: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  checkMark: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
