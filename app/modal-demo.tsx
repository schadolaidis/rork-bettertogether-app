import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DollarSign, Users, Calendar } from 'lucide-react-native';
import { StakeAmountModal } from '@/components/modal-examples/StakeAmountModal';
import { PersonSelectorModal, Person } from '@/components/modal-examples/PersonSelectorModal';
import { DateTimeModal } from '@/components/modal-examples/DateTimeModal';

const DEMO_PEOPLE: Person[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatarColor: '#3B82F6' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatarColor: '#EF4444' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatarColor: '#10B981' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', avatarColor: '#F59E0B' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', avatarColor: '#8B5CF6' },
];

export default function ModalDemoScreen() {
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);

  const [stakeValue, setStakeValue] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          title: 'Modal Input Wrapper Demo',
          headerShown: true,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ModalInputWrapper Demo</Text>
          <Text style={styles.subtitle}>
            Centered, keyboard-safe modals for various input types
          </Text>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Try the modals:</Text>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setStakeModalOpen(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              <DollarSign size={24} color="#2F6BFF" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Stake Amount</Text>
              <Text style={styles.buttonDescription}>
                {stakeValue ? `€${stakeValue}` : 'Numeric input with keyboard'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setPersonModalOpen(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Users size={24} color="#10B981" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Assign People</Text>
              <Text style={styles.buttonDescription}>
                {selectedPeople.length > 0
                  ? `${selectedPeople.length} selected`
                  : 'Multi-select with search'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setDateTimeModalOpen(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Calendar size={24} color="#F59E0B" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Date & Time</Text>
              <Text style={styles.buttonDescription}>
                {selectedDateTime
                  ? `${selectedDateTime.toLocaleDateString()} ${
                      !isAllDay
                        ? `at ${selectedDateTime.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : '(All day)'
                    }`
                  : 'Date chips + time input'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features:</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✅ Keyboard avoidance (iOS & Android)</Text>
            <Text style={styles.featureItem}>✅ Smooth animations</Text>
            <Text style={styles.featureItem}>✅ Portal-based rendering</Text>
            <Text style={styles.featureItem}>✅ Auto-focus inputs</Text>
            <Text style={styles.featureItem}>✅ Backdrop dismissal</Text>
            <Text style={styles.featureItem}>✅ Responsive width (max 560px)</Text>
            <Text style={styles.featureItem}>✅ Screen reader accessible</Text>
          </View>
        </View>
      </ScrollView>

      <StakeAmountModal
        open={stakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        onConfirm={(amount) => {
          setStakeValue(amount);
          setStakeModalOpen(false);
        }}
        currencySymbol="€"
        initialValue={stakeValue}
      />

      <PersonSelectorModal
        open={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        onConfirm={(ids) => {
          setSelectedPeople(ids);
          setPersonModalOpen(false);
        }}
        people={DEMO_PEOPLE}
        selectedIds={selectedPeople}
        multiSelect={true}
      />

      <DateTimeModal
        open={dateTimeModalOpen}
        onClose={() => setDateTimeModalOpen(false)}
        onConfirm={(date, allDay) => {
          setSelectedDateTime(date);
          setIsAllDay(allDay);
          setDateTimeModalOpen(false);
        }}
        initialDate={selectedDateTime || new Date()}
        initialAllDay={isAllDay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  demoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});
