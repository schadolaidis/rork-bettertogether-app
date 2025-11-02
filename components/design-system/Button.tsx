import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  testID?: string;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false, variant = 'primary', testID, style }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { 
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style
      ]}
      testID={testID}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={disabled ? [theme.textLow, theme.textLow] : theme.gradients.buttonPrimaryGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.buttonContent,
            {
              borderRadius: theme.radius.button,
              paddingHorizontal: theme.spacing.lg,
            }
          ]}
        >
          <Text style={[
            theme.typography.body,
            { color: '#FFFFFF', fontWeight: '600' as const }
          ]}>
            {title}
          </Text>
        </LinearGradient>
      ) : (
        <ViewButtonContent 
          theme={theme} 
          variant={variant} 
          disabled={disabled} 
          title={title} 
        />
      )}
    </Pressable>
  );
};

const ViewButtonContent: React.FC<{
  theme: Theme;
  variant: ButtonVariant;
  disabled: boolean;
  title: string;
}> = ({ theme, variant, disabled, title }) => {
  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let labelColor = theme.textHigh;

  if (variant === 'secondary') {
    backgroundColor = 'transparent';
    borderColor = theme.border;
    labelColor = theme.textHigh;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    borderColor = 'transparent';
    labelColor = theme.textLow;
  }

  return (
    <View
      style={[
        styles.buttonContent,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderRadius: theme.radius.button,
          paddingHorizontal: theme.spacing.lg,
        }
      ]}
    >
      <Text style={[
        theme.typography.body,
        { color: labelColor, fontWeight: '600' as const }
      ]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
  },
  buttonContent: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
