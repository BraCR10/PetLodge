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
  contentNoVerticalPadding: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  petName: {
    ...Typography.h4,
    fontWeight: '700',
    color: Colors.primary,
  },
  status: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  statusInProgress: {
    backgroundColor: Colors.success + '20',
    color: Colors.success,
  },
  statusConfirmed: {
    backgroundColor: Colors.warning + '20',
    color: Colors.warning,
  },
  statusCompleted: {
    backgroundColor: Colors.textTertiary + '30',
    color: Colors.textSecondary,
  },
  details: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailsButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
