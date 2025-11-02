import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type AppBarProps = {
  title: string;
  actions?: React.ReactNode;
  testID?: string;
};

export const AppBar: React.FC<AppBarProps> = ({ title, actions, testID }) => {
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          height: 56,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            },
            android: {
              elevation: 1,
            },
          }),
        }
      ]} 
      testID={testID}
    >
      <Text 
        style={[
          theme.typography.H2, 
          { color: theme.colors.textHigh }
        ]} 
        numberOfLines={1}
      >
        {title}
      </Text>
      
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
