import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppStore';
import { saveProfile } from '../../src/store/slices/profileSlice';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { generateId } from '../../src/utils/formatters';
import { notificationsService } from '../../src/services/notificationsService';
import { useHaptics } from '../../src/hooks/useHaptics';
import type { UserProfile } from '../../src/types';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(s => s.profile.profile);
  const sessions = useAppSelector(s => s.workouts.sessions);
  const { success, lightTap } = useHaptics();

  const [isEditing, setIsEditing] = useState(!profile);
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [weight, setWeight] = useState(profile?.weight?.toString() ?? '');
  const [height, setHeight] = useState(profile?.height?.toString() ?? '');
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weeklyGoal?.toString() ?? '4');
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [avatarUri, setAvatarUri] = useState(profile?.avatarUri ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access in Settings to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      lightTap();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to save your profile.');
      return;
    }
    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        id: profile?.id ?? generateId(),
        name: name.trim(),
        age: age ? parseInt(age, 10) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        weeklyGoal: weeklyGoal ? parseInt(weeklyGoal, 10) : 4,
        avatarUri: avatarUri || undefined,
        joinedDate: profile?.joinedDate ?? new Date().toISOString(),
      };
      await dispatch(saveProfile(updatedProfile));
      success();
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    lightTap();
    setNotificationsOn(value);
    if (value) {
      const granted = await notificationsService.requestPermissions();
      if (granted) {
        // Default reminder at 7:00 PM
        await notificationsService.scheduleDailyReminder(19, 0);
      } else {
        setNotificationsOn(false);
        Alert.alert('Permission denied', 'Enable notifications in your device Settings.');
      }
    } else {
      await notificationsService.cancelDailyReminder();
    }
  };

  const totalWorkouts = sessions.length;
  const joinedDate = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {profile && !isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Avatar */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.avatarSection}>
          <Pressable style={styles.avatar} onPress={isEditing ? handlePickAvatar : undefined}>
            <Text style={styles.avatarEmoji}>
              {avatarUri ? '📷' : name ? name[0].toUpperCase() : '👤'}
            </Text>
            {isEditing && <View style={styles.avatarEditBadge}><Text style={styles.avatarEditText}>✏️</Text></View>}
          </Pressable>
          {profile && !isEditing && (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              {joinedDate && <Text style={styles.joinedDate}>Member since {joinedDate}</Text>}
            </View>
          )}
        </Animated.View>

        {/* Stats summary */}
        {profile && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{totalWorkouts}</Text>
                <Text style={styles.statLbl}>Workouts</Text>
              </View>
              {profile.weight && (
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{profile.weight}</Text>
                  <Text style={styles.statLbl}>kg</Text>
                </View>
              )}
              {profile.weeklyGoal && (
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{profile.weeklyGoal}×</Text>
                  <Text style={styles.statLbl}>/ week</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Edit form */}
        {isEditing && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Info</Text>
              <FormField label="Name *" value={name} onChangeText={setName} placeholder="Your name" />
              <FormField label="Age" value={age} onChangeText={setAge} placeholder="Years" keyboardType="numeric" />
              <FormField label="Body Weight" value={weight} onChangeText={setWeight} placeholder="kg" keyboardType="decimal-pad" />
              <FormField label="Height" value={height} onChangeText={setHeight} placeholder="cm" keyboardType="decimal-pad" />
              <FormField
                label="Weekly Goal (workouts)"
                value={weeklyGoal}
                onChangeText={setWeeklyGoal}
                placeholder="4"
                keyboardType="numeric"
              />
              <Button
                label="Save Profile"
                onPress={handleSave}
                isLoading={isSaving}
                style={styles.saveButton}
              />
            </Card>
          </Animated.View>
        )}

        {/* Settings */}
        {profile && !isEditing && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Daily workout reminder</Text>
                <Switch
                  value={notificationsOn}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
              <Text style={styles.settingHint}>Reminds you at 7:00 PM every day.</Text>
            </Card>
          </Animated.View>
        )}

        {!profile && !isEditing && (
          <Button label="Set Up Profile" onPress={() => setIsEditing(true)} size="lg" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.fieldInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.text.muted}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text.primary },
  editLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },

  avatarSection: { alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '30',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  avatarEditText: { fontSize: 14 },
  profileInfo: { alignItems: 'center', gap: 2 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  joinedDate: { fontSize: FontSize.sm, color: Colors.text.secondary },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flex: 1,
  },
  statNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  statLbl: { fontSize: FontSize.sm, color: Colors.text.secondary },

  formCard: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  field: { gap: Spacing.xs },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  fieldInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  saveButton: { marginTop: Spacing.sm },

  settingsCard: { gap: Spacing.md },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: FontSize.md, color: Colors.text.primary },
  settingHint: { fontSize: FontSize.sm, color: Colors.text.muted },
});
