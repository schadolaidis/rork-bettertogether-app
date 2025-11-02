import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { Button } from '@/components/design-system/Button';
import { useTheme } from '@/contexts/ThemeContext';

export type TaskEditSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export const TaskEditSheet: React.FC<TaskEditSheetProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const footer = (
    <View style={styles.footerButtons}>
      <View style={{ flex: 1 }}>
        <Button
          title="Cancel"
          onPress={onClose}
          variant="ghost"
          testID="task-edit-cancel"
        />
      </View>
      <View style={{ width: theme.spacing.sm }} />
      <View style={{ flex: 1 }}>
        <Button
          title="Save"
          onPress={handleSave}
          variant="primary"
          testID="task-edit-save"
        />
      </View>
    </View>
  );

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Edit Task"
      showCloseButton={true}
      footer={footer}
      testID="task-edit-sheet"
    >
      <View style={[styles.contentPlaceholder, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Text style={[theme.typography.Body, { color: theme.colors.textLow }]}>
          Task fields will be injected here
        </Text>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentPlaceholder: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});
