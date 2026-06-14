import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';

interface StatBadgeProps {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  color = Colors.primary,
  style,
}) => {
  return (
    <View style={[styles.container, { borderColor: color + '40' }, style]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    minWidth: 72,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
