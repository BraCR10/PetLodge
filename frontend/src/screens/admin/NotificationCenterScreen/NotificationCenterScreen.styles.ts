import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/utils/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  notificationTypes: {
    marginBottom: Spacing.xl,
  },
  typeLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  typeScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  typeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.md,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  typeButtonText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  typeButtonActiveText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  editorSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.text,
    backgroundColor: Colors.surface,
    minHeight: 180,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  variablesSection: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
  },
  variablesTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  variablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  variableTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  variableTagText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  saveButton: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FCC',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
