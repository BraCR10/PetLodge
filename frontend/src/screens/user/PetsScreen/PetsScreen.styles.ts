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
  petContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...Typography.h4,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  petDetails: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  petIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: Spacing.md,
    backgroundColor: Colors.border,
  },
  petActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
  },
});
