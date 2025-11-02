import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';
import { ListRow } from '@/components/design-system/ListRow';
import { Edit2, ChevronRight } from 'lucide-react-native';

export default function Settings() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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
              onPress={() => console.log('Language')}
              testID="language-row"
            />
            <ListRow
              title="Currency"
              right={<ChevronRight size={20} color={theme.colors.textLow} />}
              onPress={() => console.log('Currency')}
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
              onPress={() => console.log('Theme')}
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
      </ScrollView>
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
});
