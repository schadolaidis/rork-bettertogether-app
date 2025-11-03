import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { TextField } from '@/components/form/TextField';
import { AmountInput } from '@/components/form/AmountInput';
import { Select } from '@/components/form/Select';
import { DateTimeInput } from '@/components/form/DateTimeInput';

export default function FormSmokeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [textValue, setTextValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectValue, setSelectValue] = useState<string>();
  const [dateValue, setDateValue] = useState<string | null>(null);

  const h1Style = {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight as any,
    color: theme.textHigh,
  };

  const h2Style = {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.textHigh,
  };

  const labelStyle = {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as any,
    color: theme.textLow,
  };

  const bodyStyle = {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.textHigh,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Form Smoke Test' }} />
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
      >
        <Text style={[h1Style, { marginBottom: 24 }]}>
          Form Components Smoke Test
        </Text>

        <View style={styles.fieldContainer}>
          <TextField
            label="Text Field"
            value={textValue}
            onChangeText={setTextValue}
            placeholder="Enter text"
            helperText="Helper text below field"
          />
        </View>

        <View style={styles.fieldContainer}>
          <AmountInput
            label="Amount Input"
            value={amountValue}
            onChange={setAmountValue}
            placeholder="0.00"
            helperText="With $ prefix"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Select
            label="Select"
            value={selectValue}
            onOpen={() => console.log('Select opened')}
            onChange={setSelectValue}
            options={[
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ]}
            placeholder="Choose option"
            helperText="Opens on press"
          />
        </View>

        <View style={styles.fieldContainer}>
          <DateTimeInput
            label="Date & Time"
            value={dateValue}
            onOpen={() => console.log('DateTime opened')}
            onChange={setDateValue}
            placeholder="Select date & time"
            helperText="Opens picker on press"
          />
        </View>

        <View style={{ height: 40 }} />

        <Text style={[h2Style, { marginBottom: 16 }]}>
          Verification Report
        </Text>
        <View style={[styles.reportBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <ReportRow label="Background" value={`token(surfaceAlt) = ${theme.surfaceAlt}`} labelStyle={labelStyle} bodyStyle={bodyStyle} />
          <ReportRow label="Border (default)" value={`token(border) = ${theme.border}`} labelStyle={labelStyle} bodyStyle={bodyStyle} />
          <ReportRow label="Border (focus)" value={`token(primary) = ${theme.primary}`} labelStyle={labelStyle} bodyStyle={bodyStyle} />
          <ReportRow label="Height" value="48px" labelStyle={labelStyle} bodyStyle={bodyStyle} />
          <ReportRow label="Radius" value="12px" labelStyle={labelStyle} bodyStyle={bodyStyle} />
          <ReportRow label="PaddingH" value="12px" labelStyle={labelStyle} bodyStyle={bodyStyle} />
        </View>
      </ScrollView>
    </>
  );
}

function ReportRow({ label, value, labelStyle, bodyStyle }: { label: string; value: string; labelStyle: any; bodyStyle: any }) {
  return (
    <View style={styles.reportRow}>
      <Text style={labelStyle}>{label}:</Text>
      <Text style={[bodyStyle, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  reportBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  reportRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
});
