import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import { ModalInputWrapper } from '@/components/ModalInputWrapper';

interface StakeAmountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  currencySymbol?: string;
  initialValue?: string;
}

export function StakeAmountModal({
  open,
  onClose,
  onConfirm,
  currencySymbol = '€',
  initialValue = '',
}: StakeAmountModalProps) {
  const [stake, setStake] = useState(initialValue);
  const amountRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    onConfirm(stake);
    setStake('');
  };

  const handleClose = () => {
    setStake('');
    onClose();
  };

  return (
    <ModalInputWrapper
      open={open}
      title="Set Stake Amount"
      subtitle="How much do you want to commit?"
      onClose={handleClose}
      onConfirm={handleConfirm}
      initialFocusRef={amountRef}
      testID="stake-modal"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Amount ({currencySymbol})</Text>
        <TextInput
          ref={amountRef}
          keyboardType="decimal-pad"
          placeholder="5.00"
          placeholderTextColor="#9CA3AF"
          value={stake}
          onChangeText={(text) => {
            const filtered = text.replace(/[^0-9.]/g, '');
            const parts = filtered.split('.');
            if (parts.length > 2) {
              setStake(parts[0] + '.' + parts.slice(1).join(''));
            } else {
              setStake(filtered);
            }
          }}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />
      </View>
    </ModalInputWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
});
