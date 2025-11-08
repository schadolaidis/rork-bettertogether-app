import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};

export const ListRow: React.FC<ListRowProps> = ({ title, subtitle, left, right, onPress, testID }) => {
  const { theme } = useTheme();
  if (onPress) {
    return (
      <Pressable onPress={onPress} testID={testID}>
        <View style={[styles.container, { borderBottomColor: theme.border }]}> 
          {!!left && <View style={styles.left}>{typeof left === 'string' ? <Text>{left}</Text> : left}</View>}
          <View style={styles.center}>
            <Text style={[styles.title, { color: theme.textHigh }]} numberOfLines={1}>{title}</Text>
            {!!subtitle && <Text style={[styles.subtitle, { color: theme.textLow }]} numberOfLines={1}>{subtitle}</Text>}
          </View>
          {!!right && <View style={styles.right}>{typeof right === 'string' ? <Text>{right}</Text> : right}</View>}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}> 
      {!!left && <View style={styles.left}>{typeof left === 'string' ? <Text>{left}</Text> : left}</View>}
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.textHigh }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.textLow }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {!!right && <View style={styles.right}>{typeof right === 'string' ? <Text>{right}</Text> : right}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  left: { marginRight: 12 },
  center: { flex: 1 },
  right: { marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '500' as const },
  subtitle: { fontSize: 12 },
});
