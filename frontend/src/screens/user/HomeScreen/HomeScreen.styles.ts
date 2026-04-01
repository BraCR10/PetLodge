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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  actionTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  statNumber: {
    ...Typography.h3,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
