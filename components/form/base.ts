import { TextStyle, ViewStyle } from 'react-native';
import { Theme } from '@/constants/theme';

type FormState = 'default' | 'focus' | 'error' | 'disabled';

export interface FormStyles {
  fieldHeight: number;
  radius: number;
  paddingH: number;
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  focusBorder: string;
  errorBorder: string;
  helperSize: number;
}

export const useFormStyles = (theme: Theme): FormStyles => {
  return {
    fieldHeight: 48,
    radius: 12,
    paddingH: 12,
    bg: theme.surfaceAlt,
    border: theme.border,
    text: theme.textHigh,
    textMuted: theme.textLow,
    focusBorder: theme.primary,
    errorBorder: theme.error,
    helperSize: 12,
  };
};

export const getFieldContainerStyle = (state: FormState, styles: FormStyles): ViewStyle => {
  const baseStyle: ViewStyle = {
    height: styles.fieldHeight,
    borderRadius: styles.radius,
    paddingHorizontal: styles.paddingH,
    backgroundColor: styles.bg,
    borderWidth: 1,
    borderColor: styles.border,
  };

  switch (state) {
    case 'focus':
      return {
        ...baseStyle,
        borderColor: styles.focusBorder,
      };
    case 'error':
      return {
        ...baseStyle,
        borderColor: styles.errorBorder,
      };
    case 'disabled':
      return {
        ...baseStyle,
        opacity: 0.5,
      };
    default:
      return baseStyle;
  }
};

export const getLabelStyle = (theme: Theme): TextStyle => {
  return {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as TextStyle['fontWeight'],
    color: theme.textLow,
  };
};

export const getValueTextStyle = (theme: Theme): TextStyle => {
  return {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as TextStyle['fontWeight'],
    color: theme.textHigh,
  };
};

export const getHelperTextStyle = (state: 'error' | 'default', theme: Theme): TextStyle => {
  return {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as TextStyle['fontWeight'],
    color: state === 'error' ? theme.error : theme.textLow,
  };
};
