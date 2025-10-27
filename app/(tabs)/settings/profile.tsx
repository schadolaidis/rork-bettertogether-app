import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Palette, Mail, User as UserIcon } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, currentUserId, updateUserProfile } = useApp();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState<string | undefined>(currentUser?.avatar || currentUser?.avatarUrl);
  const [selectedColor, setSelectedColor] = useState(currentUser?.color || '#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const PRESET_COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1',
    '#84CC16', '#F43F5E', '#0EA5E9', '#A855F7', '#22C55E',
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your profile picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const removeAvatar = () => {
    setAvatar(undefined);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    const success = updateUserProfile(currentUserId, {
      displayName,
      email,
      avatar,
      color: selectedColor,
    });

    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: selectedColor }]}>
              <Text style={styles.avatarText}>
                {(displayName || currentUser?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Camera size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.avatarHint}>Tap to change photo</Text>
        {avatar && (
          <TouchableOpacity onPress={removeAvatar} style={styles.removeAvatarButton}>
            <Text style={styles.removeAvatarText}>Remove photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <UserIcon size={16} color="#6B7280" />
            <Text style={styles.label}>Display Name</Text>
          </View>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Mail size={16} color="#6B7280" />
            <Text style={styles.label}>Email</Text>
          </View>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={16} color="#6B7280" />
          <Text style={styles.sectionTitle}>Avatar Color</Text>
        </View>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => {
                setSelectedColor(color);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.colorOptionSelected,
              ]}
            >
              {selectedColor === color && (
                <View style={styles.colorCheckmark}>
                  <View style={styles.colorCheckmarkInner} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700' as const,
  },
  cameraIconContainer: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  avatarHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  removeAvatarButton: {
    marginTop: 4,
  },
  removeAvatarText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  section: {
    width: '100%',
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
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
  colorGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  colorCheckmarkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    opacity: 0.2,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});

