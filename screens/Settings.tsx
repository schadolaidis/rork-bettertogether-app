import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { AppBar } from '@/components/design-system/AppBar';
import { Card } from '@/components/design-system/Card';
import { IconButton } from '@/components/design-system/IconButton';
import { Edit2 } from 'lucide-react-native';

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
});
