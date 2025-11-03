import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Portal } from '@gorhom/portal';
import { useTheme } from '@/contexts/ThemeContext';

export type ModalSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
  testID?: string;
};

export const ModalSheet: React.FC<ModalSheetProps> = ({ open, onClose, children, maxHeight, testID }) => {
  const { theme } = useTheme();
  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 40, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [open, backdrop, translateY]);

  useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => Keyboard.dismiss());
    return () => sub.remove();
  }, []);

  if (!open) return null;

  return (
    <Portal>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: backdrop, zIndex: 900 }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} testID={`${testID}-backdrop`} />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end', pointerEvents: 'box-none' }]}
      >
        <SafeAreaView pointerEvents="box-none" style={{ justifyContent: 'flex-end' }}> 
          <Animated.View style={{ transform: [{ translateY }], backgroundColor: theme.surface, borderTopLeftRadius: theme.radius.card, borderTopRightRadius: theme.radius.card, maxHeight: maxHeight ?? 560, paddingBottom: 16, zIndex: 910 }} testID={testID}>
            <View style={{ height: 4, width: 40, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginVertical: 8 }} />
            {children}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Portal>
  );
};
