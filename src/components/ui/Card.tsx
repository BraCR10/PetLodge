import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/src/utils/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
});

export const Card: React.FC<CardProps> = ({
  children,
  padding = Spacing.lg,
  margin = Spacing.sm,
  style,
}) => {
  return <View style={[styles.card, { padding, margin }, style]}>{children}</View>;
};
