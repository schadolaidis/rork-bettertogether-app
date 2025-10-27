import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { Users, Trash2, Crown, UserPlus, Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';

export default function TeamsScreen() {
  const { currentList, currentListMembers, removeMember, currentUserRole, generateInviteLink } = useApp();
  const [copied, setCopied] = useState(false);

  const handleRemoveMember = (userId: string, userName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${userName} from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const success = removeMember(userId);
            if (success) {
              Alert.alert('Success', `${userName} has been removed from the list`);
            } else {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleInviteMember = async () => {
    if (!currentList) return;

    const inviteLink = generateInviteLink(currentList.id);
    if (!inviteLink) {
      Alert.alert('Error', 'Failed to generate invite link');
      return;
    }

    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Success', 'Invite link copied to clipboard!');
    } else {
      try {
        await Share.share({
          message: `Join our list "${currentList.name}" on BetterTogether!\n\n${inviteLink}`,
          title: 'Join BetterTogether',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  if (!currentList) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No list selected</Text>
        </View>
      </View>
    );
  }

  const canInvite = currentUserRole === 'Owner';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Team Members</Text>
          <Text style={styles.infoText}>
            Manage who has access to this list. Owners can invite new members and remove existing ones.
          </Text>
        </View>

        {canInvite && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              handleInviteMember();
            }}
          >
            <View style={styles.inviteIconContainer}>
              {copied ? (
                <Check size={20} color="#10B981" />
              ) : (
                <UserPlus size={20} color="#3B82F6" />
              )}
            </View>
            <View style={styles.inviteTextContainer}>
              <Text style={styles.inviteButtonTitle}>
                {copied ? 'Invite Link Copied!' : 'Invite Member'}
              </Text>
              <Text style={styles.inviteButtonSubtitle}>Share invite link with others</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Users size={20} color="#6B7280" />
          <Text style={styles.headerText}>{currentListMembers.length} Members</Text>
        </View>

      {currentListMembers.map((member) => {
        const isOwner = currentList.ownerId === member.id;
        const canRemove = currentUserRole === 'Owner' && !isOwner;

        return (
          <View key={member.id} style={styles.memberCard}>
            <View style={[styles.avatar, { backgroundColor: member.color }]}>
              <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                {isOwner && <Crown size={16} color="#F59E0B" />}
              </View>
              <Text style={styles.memberEmail}>{member.email || 'No email'}</Text>
              <Text style={styles.memberRole}>{isOwner ? 'Owner' : 'Member'}</Text>
            </View>
            {canRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  handleRemoveMember(member.id, member.name);
                }}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  inviteTextContainer: {
    flex: 1,
  },
  inviteButtonTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  inviteButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  memberCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
  },
});
