import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function ListSettingsScreen() {
  const router = useRouter();
  const { currentList, updateListSettings, archiveList, currentUserRole } = useApp();

  const [name, setName] = useState(currentList?.name || '');
  const [currencyCode, setCurrencyCode] = useState(currentList?.currency || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(currentList?.currencySymbol || '$');
  const [defaultGrace, setDefaultGrace] = useState(
    String(currentList?.defaultGraceMinutes || 30)
  );
  const [defaultStake, setDefaultStake] = useState(
    String((currentList?.defaultStakeCents || 500) / 100)
  );
  const [allowMemberCategories, setAllowMemberCategories] = useState(
    currentList?.allowMemberCategoryManage || false
  );

  const handleSave = () => {
    if (!currentList) return;

    const graceMinutes = parseInt(defaultGrace, 10);
    const stakeCents = Math.round(parseFloat(defaultStake) * 100);

    const success = updateListSettings(currentList.id, {
      name,
      currency: currencyCode,
      currencySymbol,
      defaultGraceMinutes: isNaN(graceMinutes) ? 30 : graceMinutes,
      defaultStakeCents: isNaN(stakeCents) ? 500 : stakeCents,
      allowMemberCategoryManage: allowMemberCategories,
    });

    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'List settings updated!');
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update list settings');
    }
  };

  const handleArchive = () => {
    if (!currentList) return;

    Alert.alert(
      'Archive List',
      `Are you sure you want to archive "${currentList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            const success = archiveList(currentList.id);
            if (success) {
              Alert.alert('Success', 'List archived');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to archive list');
            }
          },
        },
      ]
    );
  };

  const canArchive = currentUserRole === 'Owner';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>List Settings</Text>
        <Text style={styles.infoText}>
          Configure your list preferences, default values, and permissions. These settings apply to all tasks and members in this list.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>List Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter list name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <View style={styles.currencyGrid}>
          {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'CUSTOM').map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyButton,
                currencyCode === currency.code && styles.currencyButtonActive,
              ]}
              onPress={() => {
                setCurrencyCode(currency.code);
                setCurrencySymbol(currency.symbol);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <Text style={styles.currencyCode}>{currency.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Defaults</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Default Grace Period (minutes)</Text>
          <TextInput
            style={styles.input}
            value={defaultGrace}
            onChangeText={setDefaultGrace}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Default Stake ({currencySymbol})</Text>
          <TextInput
            style={styles.input}
            value={defaultStake}
            onChangeText={setDefaultStake}
            keyboardType="decimal-pad"
            placeholder="5.00"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryInfoText}>
            This list has {currentList?.categories?.length || 0} categories.
            Categories are managed automatically for your list.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => {
            setAllowMemberCategories(!allowMemberCategories);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <View>
            <Text style={styles.toggleTitle}>Allow Members to Manage Categories</Text>
            <Text style={styles.toggleSubtitle}>
              Members can edit category colors and emojis
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              allowMemberCategories && styles.toggleActive,
            ]}
          >
            <View style={styles.toggleThumb} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {canArchive && (
        <TouchableOpacity style={styles.archiveButton} onPress={handleArchive}>
          <Text style={styles.archiveButtonText}>Archive List</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencyGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center' as const,
  },
  currencyButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  toggleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center' as const,
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#3B82F6',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  archiveButton: {
    backgroundColor: '#FEE2E2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  archiveButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  categoryInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryInfoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
