import React, { useEffect, useRef, ReactNode } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ModalSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: number;
  testID?: string;
};

export const ModalSheet: React.FC<ModalSheetProps> = ({
  visible,
  onClose,
  title,
  showCloseButton = true,
  header,
  children,
  footer,
  maxHeight,
  testID,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(600)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          handleDismiss();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
      ]).start();
    } else {
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 600,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, translateY, dragY]);

  const handleDismiss = () => {
    Keyboard.dismiss();
    onClose();
  };

  const computedMaxHeight = maxHeight || 
    (Platform.OS === 'web' ? 600 : undefined);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleDismiss}
            testID={`${testID}-backdrop`}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [
                { translateY: translateY },
                { translateY: dragY },
              ],
            },
          ]}
        >
          <View
            {...panResponder.panHandlers}
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: theme.radius,
                borderTopRightRadius: theme.radius,
                maxHeight: computedMaxHeight,
                paddingBottom: insets.bottom || theme.spacing.md,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: theme.elevation.sheet,
              },
            ]}
            testID={testID}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: theme.colors.border,
                  borderRadius: theme.spacing.xxs / 2,
                },
              ]}
            />

            {(title || header || showCloseButton) && (
              <View
                style={[
                  styles.header,
                  {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                  },
                ]}
              >
                {header || (
                  <View style={styles.headerContent}>
                    {title && (
                      <Text
                        style={[
                          theme.typography.H2,
                          { color: theme.colors.textHigh },
                        ]}
                      >
                        {title}
                      </Text>
                    )}
                    {showCloseButton && (
                      <Pressable
                        onPress={handleDismiss}
                        style={({ pressed }) => [
                          styles.closeButton,
                          {
                            opacity: pressed ? 0.6 : 1,
                          },
                        ]}
                        hitSlop={theme.spacing.xs}
                        testID={`${testID}-close`}
                      >
                        <X size={24} color={theme.colors.textLow} />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            )}

            <ScrollView
              style={styles.content}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
              }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {footer && (
              <View
                style={[
                  styles.footer,
                  {
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                  },
                ]}
              >
                {footer}
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
  },
  handle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    minHeight: 56,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  footer: {
    flexShrink: 0,
  },
});
