import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/design-system/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { Circle } from 'lucide-react-native';

export type GoalCardProps = {
  title: string;
  subtitle: string;
  saved: number;
  target: number;
};

export const GoalCard: React.FC<GoalCardProps> = ({ title, subtitle, saved, target }) => {
  const { theme } = useTheme();

  return (
    <Card style={styles.container}>
      <View style={[styles.header, { marginBottom: theme.spacing.xs }]}>
        <Circle size={20} color={theme.colors.textLow} />
        <Text style={[theme.typography.Label, { color: theme.colors.textLow }]}>
          ${saved} / ${target}
        </Text>
      </View>
      
      <Text style={[theme.typography.H2, { color: theme.colors.textHigh, marginBottom: theme.spacing.xs }]}>
        {title}
      </Text>
      
      <Text style={[theme.typography.Caption, { color: theme.colors.textLow }]}>
        {subtitle}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
