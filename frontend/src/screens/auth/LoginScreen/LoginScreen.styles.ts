import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/src/utils/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  logo: {
    ...Typography.h1,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  link: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
});
