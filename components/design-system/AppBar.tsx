import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type AppBarProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  testID?: string;
};

export const AppBar: React.FC<AppBarProps> = ({ title, left, right, testID }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { height: theme.appBar.height, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} testID={testID}>
      <View style={styles.side}>{typeof left === 'string' ? <Text>{left}</Text> : left}</View>
      <Text style={[styles.title, { color: theme.colors.textHigh }]} numberOfLines={1}>{title}</Text>
      <View style={styles.side}>{typeof right === 'string' ? <Text>{right}</Text> : right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  side: { width: 64, alignItems: 'flex-start', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' as const },
});
