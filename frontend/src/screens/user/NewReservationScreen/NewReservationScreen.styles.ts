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
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  petSelector: {
    gap: Spacing.sm,
  },
  petOption: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  petOptionText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  petOptionIcon: {
    fontSize: 20,
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  actions: {
    gap: Spacing.md,
  },
});
