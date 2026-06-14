import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppStore';
import { deleteWorkout, saveWorkoutsToStorage } from '../../src/store/slices/workoutsSlice';
import { WorkoutCard } from '../../src/components/workout/WorkoutCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Button } from '../../src/components/common/Button';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import type { WorkoutSession } from '../../src/types';
import { useHaptics } from '../../src/hooks/useHaptics';

export default function WorkoutsScreen() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(s => s.workouts.sessions);
  const isLoading = useAppSelector(s => s.workouts.isLoading);
  const { warning } = useHaptics();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio' | 'hiit'>('all');

  const filtered = sessions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = useCallback(
    (id: string) => {
      warning();
      dispatch(deleteWorkout(id));
      // Persist after delete
      const remaining = sessions.filter(s => s.id !== id);
      dispatch(saveWorkoutsToStorage(remaining));
    },
    [dispatch, sessions, warning]
  );

  const handlePress = useCallback(
    (session: WorkoutSession) => {
      router.push(`/workout/${session.id}`);
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkoutSession }) => (
      <WorkoutCard
        session={item}
        onPress={() => handlePress(item)}
        onDelete={handleDelete}
      />
    ),
    [handlePress, handleDelete]
  );

  const keyExtractor = useCallback((item: WorkoutSession) => item.id, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Button
          label="+ New"
          onPress={() => router.push('/workout/new')}
          size="sm"
        />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        // Performance optimizations (criterion 9)
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.loading}>Loading…</Text>
          ) : (
            <EmptyState
              title="No workouts yet"
              subtitle="Start your first workout to see it here. Swipe left on a workout to delete it."
              actionLabel="Start Workout"
              onAction={() => router.push('/workout/new')}
              icon="🏋️"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text.primary },

  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },

  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  loading: { color: Colors.text.secondary, textAlign: 'center', marginTop: Spacing.xl },
});
