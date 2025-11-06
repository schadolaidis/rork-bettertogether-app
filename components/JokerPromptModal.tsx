import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ModalSheet } from '@/components/design-system/ModalSheet';
import { Button } from '@/components/design-system/Button';

interface JokerPromptModalProps {
  visible: boolean;
  onUseJoker: () => void;
  onPayStake: () => void;
  jokerCount: number;
  stakeAmount: number;
  currencySymbol: string;
}

export function JokerPromptModal({
  visible,
  onUseJoker,
  onPayStake,
  jokerCount,
  stakeAmount,
  currencySymbol,
}: JokerPromptModalProps) {
  const { theme } = useTheme();

  return (
    <ModalSheet
      open={visible}
      onClose={onPayStake}
      maxHeight={400}
      testID="joker-prompt-modal"
    >
      <View style={[styles.container, { paddingHorizontal: theme.spacing.md }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🃏</Text>
        </View>

        <Text
          style={[
            theme.typography.h1,
            { color: theme.textHigh, textAlign: 'center', marginTop: theme.spacing.md },
          ]}
        >
          Aufgabe gescheitert!
        </Text>

        <Text
          style={[
            theme.typography.body,
            {
              color: theme.textLow,
              textAlign: 'center',
              marginTop: theme.spacing.sm,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          Du hast noch {jokerCount} Joker! Möchtest du einen Joker einsetzen, um deinen Einsatz
          von {currencySymbol}{stakeAmount} zu retten?
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Ja, Joker einsetzen"
            onPress={onUseJoker}
            variant="primary"
            style={styles.button}
            testID="use-joker-button"
          />

          <Button
            title="Nein, Einsatz zahlen"
            onPress={onPayStake}
            variant="secondary"
            style={styles.button}
            testID="pay-stake-button"
          />
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[theme.typography.caption, { color: theme.textLow, textAlign: 'center' }]}>
            💡 Du verdienst alle 10 erledigten Aufgaben einen Joker
          </Text>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 48,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
