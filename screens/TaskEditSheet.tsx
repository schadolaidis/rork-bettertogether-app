import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { Button } from '@/components/design-system/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { TextField } from '@/components/form/TextField';
import { Select, SelectOption } from '@/components/form/Select';
import { DateTimeInput, DateTimeValue } from '@/components/form/DateTimeInput';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusGoal, setFocusGoal] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<DateTimeValue | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const focusGoalOptions: SelectOption[] = [
    { label: 'Health & Fitness', value: 'health' },
    { label: 'Career & Work', value: 'career' },
    { label: 'Finance & Savings', value: 'finance' },
    { label: 'Learning & Education', value: 'learning' },
    { label: 'Relationships', value: 'relationships' },
    { label: 'Personal Growth', value: 'personal' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError(undefined);
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
      <View style={[styles.content, { gap: theme.spacing.md }]}>
        <TextField
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(undefined);
          }}
          placeholder="Enter task name"
          errorText={nameError}
          testID="task-name-field"
        />

        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description (optional)"
          multiline
          numberOfLines={3}
          testID="task-description-field"
        />

        <Select
          label="Focus Goal"
          value={focusGoal}
          onChange={setFocusGoal}
          options={focusGoalOptions}
          placeholder="Select a focus goal"
          testID="task-focus-goal-field"
        />

        <DateTimeInput
          label="Due Date & Time"
          value={dueDate}
          onChange={setDueDate}
          placeholder="Select due date & time"
          testID="task-due-date-field"
        />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'column',
  },
});
