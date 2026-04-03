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
  roomSelector: {
    gap: Spacing.sm,
  },
  roomOption: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  roomOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  roomOptionText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxCheck: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
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
  dateButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  dateButtonLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateButtonValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  serviciosContainer: {
    marginVertical: Spacing.sm,
  },
  serviciosLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  serviciosGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  servicioButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  servicioButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
  },
  servicioIcon: {
    fontSize: 24,
  },
  servicioLabelText: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.md,
  },
});
