import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Portal } from '@gorhom/portal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesignTokens } from '@/constants/design-tokens';

export type ModalInputWrapperProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  dismissOnBackdrop?: boolean;
  avoidKeyboard?: boolean;
  initialFocusRef?: React.RefObject<any>;
  maxWidth?: number;
  testID?: string;
  children: React.ReactNode;
};

export const ModalInputWrapper: React.FC<ModalInputWrapperProps> = ({
  open,
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmLabel = 'Done',
  dismissOnBackdrop = true,
  avoidKeyboard = true,
  initialFocusRef,
  maxWidth = 560,
  testID,
  children,
}) => {
  const { height, width } = useWindowDimensions();
  const backdrop = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const kbOffset = useRef(new Animated.Value(0)).current;
  const isPortrait = height >= width;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => initialFocusRef?.current?.focus?.(), 50);
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 20,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, backdrop, cardY, initialFocusRef]);

  useEffect(() => {
    if (!avoidKeyboard) return;
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: any) =>
      Animated.timing(kbOffset, {
        toValue: Math.min(e.endCoordinates.height - 8, height * 0.4),
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    const onHide = () =>
      Animated.timing(kbOffset, {
        toValue: 0,
        duration: 160,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    const s = Keyboard.addListener(showEvt, onShow);
    const h = Keyboard.addListener(hideEvt, onHide);
    return () => {
      s.remove();
      h.remove();
    };
  }, [avoidKeyboard, height, kbOffset]);

  if (!open) return null;

  const backdropStyle = {
    backgroundColor: 'rgba(0,0,0,0.4)',
    opacity: backdrop,
    ...StyleSheet.absoluteFillObject,
    zIndex: DesignTokens.zIndex.scrim,
  } as const;

  const translateY = Animated.add(cardY, Animated.multiply(kbOffset, -1));
  const cardStyle = {
    transform: [{ translateY }],
    alignSelf: 'center' as const,
    width: Math.min(width - 32, maxWidth),
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: DesignTokens.zIndex.sheet,
  } as const;

  return (
    <Portal>
      <Animated.View style={backdropStyle}>
        <Pressable
          testID={`${testID}-backdrop`}
          style={{ flex: 1 }}
          onPress={() => {
            Keyboard.dismiss();
            if (dismissOnBackdrop) onClose();
          }}
        />
      </Animated.View>

      <SafeAreaView
        pointerEvents="box-none"
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
        }}
      >
        <Animated.View style={cardStyle} testID={testID}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View
            style={{
              maxHeight: isPortrait ? height * 0.45 : height * 0.7,
            }}
          >
            {children}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelButton} accessibilityRole="button">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.confirmButton} accessibilityRole="button">
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2F6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
