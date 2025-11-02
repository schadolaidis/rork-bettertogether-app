import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export type AppBarProps = {
  title: string;
  actions?: React.ReactNode;
  testID?: string;
};

export const AppBar: React.FC<AppBarProps> = ({ title, actions, testID }) => {
  const { theme } = useTheme();
  
  return (
    <LinearGradient
      colors={theme.gradients.appBarGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.container, 
        { 
          height: 56,
          borderBottomColor: theme.border,
        }
      ]} 
    >
      <View style={styles.content} testID={testID}>
        <Text 
          style={[
            theme.typography.h2, 
            { color: theme.textHigh }
          ]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
  },
  content: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
