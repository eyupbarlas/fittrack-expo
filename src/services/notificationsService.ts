import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationsService = {
  /**
   * Requests notification permissions from the user.
   * Must be called before scheduling any notifications.
   */
  requestPermissions: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workouts', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Schedules a daily workout reminder at a given hour.
   * Replaces any existing daily reminder.
   */
  scheduleDailyReminder: async (hour: number, minute: number): Promise<string | null> => {
    try {
      // Cancel existing daily reminders first
      await notificationsService.cancelDailyReminder();

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to train! 💪",
          body: "Your workout is waiting. Keep your streak going!",
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
      });
      return id;
    } catch {
      return null;
    }
  },

  /**
   * Sends an immediate notification on workout completion.
   */
  sendWorkoutCompleteNotification: async (workoutName: string, durationSeconds: number) => {
    const mins = Math.floor(durationSeconds / 60);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Workout Complete! 🏆",
          body: `Great job finishing "${workoutName}" in ${mins} minutes!`,
          data: { type: 'workout_complete' },
        },
        trigger: null, // Send immediately
      });
    } catch {
      // Notifications are non-critical — silently ignore failures
    }
  },

  cancelDailyReminder: async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const dailyReminders = scheduled.filter(
        n => (n.content.data as { type?: string })?.type === 'daily_reminder'
      );
      await Promise.all(
        dailyReminders.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    } catch {
      // Non-critical
    }
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
