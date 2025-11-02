import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';
import { ListRow } from '@/components/design-system/ListRow';
import { Button } from '@/components/design-system/Button';
import { ModalSheet } from '@/components/design-system/ModalSheet';
import { Edit2, ChevronRight, Check } from 'lucide-react-native';

type Language = 'en' | 'de' | 'it';
type Currency = 'EUR' | 'USD';

export default function Settings() {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');

  const languageOptions: { label: string; value: Language }[] = [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Italiano', value: 'it' },
  ];

  const currencyOptions: { label: string; value: Currency }[] = [
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'USD ($)', value: 'USD' },
  ];

  const handleLanguageChange = (value: Language) => {
    setSelectedLanguage(value);
    setLanguageModalOpen(false);
  };

  const handleCurrencyChange = (value: Currency) => {
    setSelectedCurrency(value);
    setCurrencyModalOpen(false);
  };

  const handleThemeToggle = (isDark: boolean) => {
    setMode(isDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppBar
        title="Settings"
        testID="settings-appbar"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard} padded={false}>
          <View style={styles.profileContent}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.profileInfo}>
              <Text style={[theme.typography.H2, { color: theme.colors.textHigh }]}>
                John Doe
              </Text>
              <Text style={[theme.typography.Caption, { color: theme.colors.textLow }]}>
                john.doe@example.com
              </Text>
            </View>
            <IconButton
              icon={<Edit2 size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Edit profile')}
              style={styles.editButton}
              testID="edit-profile-button"
            />
          </View>
        </Card>

        {/* Section A - Account */}
        <View style={styles.section}>
          <Text style={[theme.typography.Caption, styles.sectionTitle, { color: theme.colors.textLow }]}>
            ACCOUNT
          </Text>
          <Card style={styles.listCard} padded={false}>
            <ListRow
              title="Language"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => setLanguageModalOpen(true)}
              testID="language-row"
            />
            <ListRow
              title="Currency"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => setCurrencyModalOpen(true)}
              testID="currency-row"
            />
            <ListRow
              title="Notifications"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Notifications')}
              testID="notifications-row"
            />
          </Card>
        </View>

        {/* Section B - Appearance */}
        <View style={styles.section}>
          <Text style={[theme.typography.Caption, styles.sectionTitle, { color: theme.colors.textLow }]}>
            APPEARANCE
          </Text>
          <Card style={styles.listCard} padded={false}>
            <ListRow
              title="Theme"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => setThemeModalOpen(true)}
              testID="theme-row"
            />
          </Card>
        </View>

        {/* Section C - Workspace */}
        <View style={styles.section}>
          <Text style={[theme.typography.Caption, styles.sectionTitle, { color: theme.colors.textLow }]}>
            WORKSPACE
          </Text>
          <Card style={styles.listCard} padded={false}>
            <ListRow
              title="Members"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Members')}
              testID="members-row"
            />
            <ListRow
              title="Defaults"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Defaults')}
              testID="defaults-row"
            />
          </Card>
        </View>

        {/* Section D - Categories */}
        <View style={styles.section}>
          <Text style={[theme.typography.Caption, styles.sectionTitle, { color: theme.colors.textLow }]}>
            CATEGORIES
          </Text>
          <Card style={styles.listCard} padded={false}>
            <ListRow
              title="Manage Task Categories"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Manage categories')}
              testID="categories-row"
            />
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[theme.typography.Body, { color: theme.colors.textLow, textAlign: 'center' }]}>
            Version 1.0.0
          </Text>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            style={{ marginTop: 24, width: '100%' }}
            testID="logout-button"
          />
        </View>
      </ScrollView>

      {/* Language Modal */}
      <ModalSheet
        open={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        maxHeight={480}
        testID="language-modal"
      >
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md }}>
          <Text
            style={[
              theme.typography.H2,
              { color: theme.colors.textHigh, marginBottom: theme.spacing.md },
            ]}
          >
            Language
          </Text>
          <View>
            {languageOptions.map((option, index) => {
              const isSelected = option.value === selectedLanguage;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      paddingVertical: theme.spacing.md,
                      borderBottomWidth: index < languageOptions.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleLanguageChange(option.value)}
                  testID={`language-option-${option.value}`}
                >
                  <Text
                    style={[
                      theme.typography.Body,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.textHigh,
                        flex: 1,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ModalSheet>

      {/* Currency Modal */}
      <ModalSheet
        open={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
        maxHeight={480}
        testID="currency-modal"
      >
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md }}>
          <Text
            style={[
              theme.typography.H2,
              { color: theme.colors.textHigh, marginBottom: theme.spacing.md },
            ]}
          >
            Currency
          </Text>
          <View>
            {currencyOptions.map((option, index) => {
              const isSelected = option.value === selectedCurrency;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      paddingVertical: theme.spacing.md,
                      borderBottomWidth: index < currencyOptions.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleCurrencyChange(option.value)}
                  testID={`currency-option-${option.value}`}
                >
                  <Text
                    style={[
                      theme.typography.Body,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.textHigh,
                        flex: 1,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ModalSheet>

      {/* Theme Modal */}
      <ModalSheet
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        maxHeight={320}
        testID="theme-modal"
      >
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md }}>
          <Text
            style={[
              theme.typography.H2,
              { color: theme.colors.textHigh, marginBottom: theme.spacing.md },
            ]}
          >
            Theme
          </Text>
          <View style={styles.themeToggleContainer}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.Body, { color: theme.colors.textHigh }]}>
                Dark Mode
              </Text>
              <Text style={[theme.typography.Caption, { color: theme.colors.textLow }]}>
                {mode === 'dark' ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
              testID="theme-toggle"
            />
          </View>
        </View>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  listCard: {
    overflow: 'hidden',
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
