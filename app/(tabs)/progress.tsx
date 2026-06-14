import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector } from '../../src/hooks/useAppStore';
import { ProgressRing } from '../../src/components/progress/ProgressRing';
import { Card } from '../../src/components/common/Card';
import { StatBadge } from '../../src/components/common/StatBadge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { formatDuration, formatVolume, getWeekStart } from '../../src/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgressScreen() {
  const sessions = useAppSelector(s => s.workouts.sessions);
  const profile = useAppSelector(s => s.profile.profile);
  const weeklyGoal = profile?.weeklyGoal ?? 4;

  const stats = useMemo(() => {
    const weekStart = new Date(getWeekStart());
    const thisWeek = sessions.filter(s => new Date(s.date) >= weekStart);

    const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);

    // Last 7 days bar chart data
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const count = sessions.filter(s => {
        const sd = new Date(s.date);
        sd.setHours(0, 0, 0, 0);
        return sd.getTime() === d.getTime();
      }).length;
      return {
        day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][(d.getDay() + 6) % 7],
        count,
        isToday: i === 6,
      };
    });

    // Personal records
    const prMap: Record<string, { name: string; weight: number; reps: number }> = {};
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight && set.reps) {
            const volume = set.weight * set.reps;
            if (!prMap[ex.exercise.id] || volume > prMap[ex.exercise.id].weight * prMap[ex.exercise.id].reps) {
              prMap[ex.exercise.id] = {
                name: ex.exercise.name,
                weight: set.weight,
                reps: set.reps,
              };
            }
          }
        });
      });
    });

    return {
      thisWeekCount: thisWeek.length,
      totalSessions: sessions.length,
      totalVolume,
      totalDuration,
      last7,
      prs: Object.values(prMap).slice(0, 5),
    };
  }, [sessions]);

  const maxBarCount = Math.max(...stats.last7.map(d => d.count), 1);

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>
        <EmptyState
          title="Nothing to show yet"
          subtitle="Complete your first workout to start tracking your progress."
          icon="📈"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </Animated.View>

        {/* Weekly goal ring */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={styles.weekCard}>
            <Text style={styles.sectionTitle}>Weekly Goal</Text>
            <View style={styles.weekContent}>
              <ProgressRing
                progress={stats.thisWeekCount / weeklyGoal}
                size={120}
                label={`${stats.thisWeekCount}/${weeklyGoal}`}
                sublabel="workouts"
                color={
                  stats.thisWeekCount >= weeklyGoal ? Colors.secondary : Colors.primary
                }
              />
              <View style={styles.totalStats}>
                <StatBadge
                  label="All Time"
                  value={String(stats.totalSessions)}
                  color={Colors.primary}
                />
                <StatBadge
                  label="Total Time"
                  value={formatDuration(stats.totalDuration)}
                  color={Colors.accent}
                />
                <StatBadge
                  label="Total Volume"
                  value={formatVolume(stats.totalVolume)}
                  color={Colors.secondary}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Last 7 days bar chart */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Last 7 Days</Text>
            <View style={styles.barChart}>
              {stats.last7.map((day, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: day.count > 0 ? (day.count / maxBarCount) * 80 : 4,
                          backgroundColor: day.isToday
                            ? Colors.primary
                            : day.count > 0
                            ? Colors.primaryLight
                            : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, day.isToday && { color: Colors.primary }]}>
                    {day.day}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Personal Records */}
        {stats.prs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Card style={styles.prCard}>
              <Text style={styles.sectionTitle}>Personal Records 🏆</Text>
              {stats.prs.map((pr, i) => (
                <View key={i} style={styles.prRow}>
                  <Text style={styles.prName}>{pr.name}</Text>
                  <Text style={styles.prValue}>
                    {pr.weight} kg × {pr.reps} reps
                  </Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  header: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text.primary },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.md },

  weekCard: { gap: Spacing.md },
  weekContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flexWrap: 'wrap' },
  totalStats: { flex: 1, gap: Spacing.sm, minWidth: 150 },

  chartCard: {},
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
  },
  barColumn: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  barWrapper: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 20, borderRadius: BorderRadius.sm, minHeight: 4 },
  barLabel: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.semibold },

  prCard: { gap: Spacing.sm },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prName: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.medium },
  prValue: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.bold },
});
