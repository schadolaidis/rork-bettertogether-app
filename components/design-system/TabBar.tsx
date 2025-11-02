import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

export type TabBarProps = {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  testID?: string;
};

export const TabBar: React.FC<TabBarProps> = ({ items, activeKey, onChange, testID }) => {
  const { theme } = useTheme();
  
  if (items.length > 5) {
    console.warn('TabBar supports up to 5 items. Additional items will be hidden.');
  }
  
  const displayItems = items.slice(0, 5);
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        }
      ]} 
      testID={testID}
    >
      {displayItems.map((item) => {
        const isActive = item.key === activeKey;
        
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={styles.tabItem}
            testID={`${testID}-${item.key}`}
          >
            {item.icon && (
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
            )}
            <Text 
              style={[
                theme.typography.Caption,
                { 
                  color: isActive ? theme.colors.primary : theme.colors.textLow,
                  fontWeight: isActive ? '600' : '400',
                }
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
  },
});
