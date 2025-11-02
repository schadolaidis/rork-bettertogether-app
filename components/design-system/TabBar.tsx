import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TabItem = { key: string; label: string };

export type TabBarProps = {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  testID?: string;
};

export const TabBar: React.FC<TabBarProps> = ({ items, activeKey, onChange, testID }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }] } testID={testID}>
      {items.map((it) => {
        const active = it.key === activeKey;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} style={styles.tab}>
            <Text style={{ color: active ? theme.colors.primary : theme.colors.textLow, fontWeight: active ? '600' as const : '500' as const }}>{it.label}</Text>
            <View style={{ height: 2, marginTop: 6, backgroundColor: active ? theme.colors.primary : 'transparent', borderRadius: 1, width: '100%' }} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'transparent' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
});
