import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/src/utils/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  requiredNote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actions: {
    gap: Spacing.md,
  },
});
