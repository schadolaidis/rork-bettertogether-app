import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from '@/components/design-system/Card';
import { useTheme } from '@/contexts/ThemeContext';

export const GoalCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card style={styles.container}>
      <Text style={[styles.placeholder, { color: theme.colors.textLow }]}>
        GoalCard placeholder
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {},
  placeholder: {
    fontSize: 16,
  },
});
