import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector } from '../../src/hooks/useAppStore';
import { ProgressRing } from '../../src/components/progress/ProgressRing';
import { StatBadge } from '../../src/components/common/StatBadge';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { formatDuration, formatVolume, getWeekStart } from '../../src/utils/formatters';

export default function HomeScreen() {
  const sessions = useAppSelector(s => s.workouts.sessions);
  const profile = useAppSelector(s => s.profile.profile);
  const activeSession = useAppSelector(s => s.workouts.activeSession);

  const weeklyGoal = profile?.weeklyGoal ?? 4;
  const firstName = profile?.name?.split(' ')[0] ?? 'Athlete';

  const weekStats = useMemo(() => {
    const weekStart = new Date(getWeekStart());
    const thisWeek = sessions.filter(s => new Date(s.date) >= weekStart);
    const totalDuration = thisWeek.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const totalVolume = thisWeek.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);
    return {
      count: thisWeek.length,
      duration: totalDuration,
      volume: totalVolume,
    };
  }, [sessions]);

  const recentSessions = sessions.slice(0, 3);
  const streakDays = useMemo(() => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasWorkout = sessions.some(s => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasWorkout) streak++;
      else if (i > 0) break; // Stop streak on first gap (not today)
    }
    return streak;
  }, [sessions]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()}, 👋</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          {streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>{streakDays}</Text>
            </View>
          )}
        </Animated.View>

        {/* Active workout banner */}
        {activeSession && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Pressable style={styles.activeBanner} onPress={() => router.push('/workout/active')}>
              <Text style={styles.activeDot}>⚡</Text>
              <Text style={styles.activeText}>Workout in progress — tap to continue</Text>
              <Text style={styles.activeArrow}>›</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Weekly Progress */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={styles.weekCard}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weekContent}>
              <ProgressRing
                progress={weekStats.count / weeklyGoal}
                size={110}
                label={`${weekStats.count}/${weeklyGoal}`}
                sublabel="workouts"
                color={Colors.primary}
              />
              <View style={styles.weekStats}>
                <StatBadge
                  label="Time"
                  value={formatDuration(weekStats.duration)}
                  color={Colors.accent}
                />
                <StatBadge
                  label="Volume"
                  value={formatVolume(weekStats.volume)}
                  color={Colors.secondary}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Start Workout CTA */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Button
            label={activeSession ? '▶ Resume Workout' : '+ Start Workout'}
            onPress={() =>
              activeSession ? router.push('/workout/active') : router.push('/workout/new')
            }
            size="lg"
            style={styles.ctaButton}
          />
        </Animated.View>

        {/* Recent Workouts */}
        {recentSessions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <Pressable onPress={() => router.push('/workouts')}>
                <Text style={styles.seeAll}>See all →</Text>
              </Pressable>
            </View>
            {recentSessions.map(session => (
              <Pressable
                key={session.id}
                style={styles.recentItem}
                onPress={() => router.push(`/workout/${session.id}`)}
              >
                <View style={styles.recentLeft}>
                  <Text style={styles.recentName}>{session.name}</Text>
                  <Text style={styles.recentMeta}>
                    {formatDuration(session.duration ?? 0)} · {session.exercises.length} exercises
                  </Text>
                </View>
                <Text style={styles.recentArrow}>›</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {sessions.length === 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.emptyHint}>
            <Text style={styles.emptyEmoji}>🚀</Text>
            <Text style={styles.emptyTitle}>Ready to start?</Text>
            <Text style={styles.emptySubtitle}>
              Log your first workout and start tracking your fitness journey.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.md, color: Colors.text.secondary },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text.primary },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  streakFire: { fontSize: 18 },
  streakText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.accent },

  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '25',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  activeDot: { fontSize: 20 },
  activeText: { flex: 1, fontSize: FontSize.md, color: Colors.primaryLight, fontWeight: FontWeight.semibold },
  activeArrow: { fontSize: FontSize.xl, color: Colors.primaryLight },

  weekCard: { gap: Spacing.md },
  weekContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  weekStats: { flex: 1, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },

  ctaButton: { borderRadius: BorderRadius.lg },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  recentLeft: { flex: 1, gap: 2 },
  recentName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  recentMeta: { fontSize: FontSize.sm, color: Colors.text.secondary },
  recentArrow: { fontSize: FontSize.xl, color: Colors.text.muted },

  emptyHint: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});
