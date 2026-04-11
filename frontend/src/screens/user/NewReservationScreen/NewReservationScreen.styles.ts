import { StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/utils/theme';

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
  required: {
    color: Colors.error,
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
  // Requirement checklist
  checklist: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checklistTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checklistDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistDotDone: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  checklistDotCheck: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  checklistText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  checklistTextDone: {
    color: Colors.text,
  },
  checklistHint: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: 26,
  },
  // Pet card styles
  petGrid: {
    gap: Spacing.sm,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  petCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  petAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  petCardInfo: {
    flex: 1,
  },
  petCardName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  petCardBreed: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  petCardCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardCheckText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  // Room section
  roomSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roomCount: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  roomEmptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  roomEmptyIcon: {
    fontSize: 32,
  },
  roomEmptyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roomChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  roomChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  roomChipPrefix: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 3,
  },
  roomChipPrefixSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  roomChipNumber: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  roomChipNumberSelected: {
    color: '#fff',
  },
  roomChipCheck: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  roomChipUnavailable: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    opacity: 0.45,
  },
  roomChipTextUnavailable: {
    color: Colors.textSecondary,
  },
  roomChipUnavailableLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    marginLeft: 2,
  },
});
