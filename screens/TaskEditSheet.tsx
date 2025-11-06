import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Animated } from 'react-native';
import { ModalSheet } from '@/components/interactive/modals/ModalSheet';
import { Button } from '@/components/design-system/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { TextField } from '@/components/form/TextField';
import { Select, SelectOption } from '@/components/form/Select';
import { DateTimeInput } from '@/components/form/DateTimeInput';
import { AmountInput } from '@/components/form/AmountInput';

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
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [assignee, setAssignee] = useState<string | undefined>(undefined);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const toggleAnimation = React.useRef(new Animated.Value(0)).current;

  const focusGoalOptions: SelectOption[] = [
    { label: 'Gesundheit & Fitness', value: 'health' },
    { label: 'Karriere & Arbeit', value: 'career' },
    { label: 'Finanzen & Ersparnisse', value: 'finance' },
    { label: 'Lernen & Bildung', value: 'learning' },
    { label: 'Beziehungen', value: 'relationships' },
    { label: 'Persönliches Wachstum', value: 'personal' },
  ];

  const assigneeOptions: SelectOption[] = [
    { label: 'Alex Johnson', value: 'alex' },
    { label: 'Sam Williams', value: 'sam' },
    { label: 'Jordan Lee', value: 'jordan' },
    { label: 'Taylor Brown', value: 'taylor' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Name ist erforderlich');
      return;
    }
    setNameError(undefined);
    onSave?.();
    onClose();
  };

  const handleToggle = () => {
    const newValue = !reminderEnabled;
    setReminderEnabled(newValue);
    Animated.timing(toggleAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    toggleAnimation.setValue(reminderEnabled ? 1 : 0);
  }, [reminderEnabled, toggleAnimation]);

  const footer = (
    <View style={styles.footerButtons}>
      <View style={{ flex: 1 }}>
        <Button
          title="Abbrechen"
          onPress={onClose}
          variant="ghost"
          testID="task-edit-cancel"
        />
      </View>
      <View style={{ width: theme.spacing.sm }} />
      <View style={{ flex: 1 }}>
        <Button
          title="Speichern"
          onPress={handleSave}
          variant="primary"
          disabled={!name.trim()}
          testID="task-edit-save"
        />
      </View>
    </View>
  );

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Aufgabe bearbeiten"
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
          placeholder="Aufgabenname eingeben"
          errorText={nameError}
          testID="task-name-field"
        />

        <TextField
          label="Beschreibung"
          value={description}
          onChangeText={setDescription}
          placeholder="Aufgabenbeschreibung eingeben (optional)"
          multiline
          numberOfLines={3}
          testID="task-description-field"
        />

        <Select
          label="Sparziel"
          value={focusGoal}
          onChange={setFocusGoal}
          options={focusGoalOptions}
          placeholder="Wähle ein Sparziel"
          testID="task-focus-goal-field"
        />

        <DateTimeInput
          label="Fälligkeitsdatum & Zeit"
          value={dueDate}
          onChange={(value) => {
            console.log('Date changed:', value);
            setDueDate(value);
          }}
          placeholder="Fälligkeitsdatum & Zeit auswählen"
          testID="task-due-date-field"
        />

        <AmountInput
          label="Einsatz"
          value={stakeAmount}
          onChange={setStakeAmount}
          prefix="€"
          placeholder="0,00"
          testID="task-stake-field"
        />

        <Select
          label="Zugewiesen an"
          value={assignee}
          onChange={setAssignee}
          options={assigneeOptions}
          placeholder="Person auswählen (optional)"
          testID="task-assignee-field"
        />

        <Pressable
          style={[styles.toggleRow, { paddingVertical: theme.spacing.sm }]}
          onPress={handleToggle}
          testID="task-reminder-toggle"
        >
          <Text
            style={[
              theme.typography.label,
              { color: theme.textHigh, flex: 1 },
            ]}
          >
            Erinnerung
          </Text>
          <Animated.View
            style={[
              styles.toggle,
              {
                backgroundColor: reminderEnabled
                  ? theme.primary
                  : theme.surfaceAlt,
                borderRadius: 16,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: theme.surface,
                  transform: [
                    {
                      translateX: toggleAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 22],
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        </Pressable>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 48,
    height: 28,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
