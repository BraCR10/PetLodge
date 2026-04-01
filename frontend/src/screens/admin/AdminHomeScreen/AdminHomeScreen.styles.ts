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
  badge: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  welcomeText: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  moduleCard: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  moduleTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
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
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  logoutButton: {
    marginBottom: Spacing.lg,
  },
});
