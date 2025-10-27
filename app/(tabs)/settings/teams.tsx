import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Share, TextInput } from 'react-native';
import { Users, Trash2, Crown, UserPlus, Check, Calendar, Mail, User as UserIcon } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';

export default function TeamsScreen() {
  const { currentList, currentListMembers, removeMember, currentUserRole, generateInviteLink } = useApp();
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

        {currentListMembers.length > 5 && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        <View style={styles.header}>
          <Users size={20} color="#6B7280" />
          <Text style={styles.headerText}>{currentListMembers.length} {currentListMembers.length === 1 ? 'Member' : 'Members'}</Text>
        </View>

      {currentListMembers
        .filter((member) => 
          searchQuery === '' || 
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
          if (currentList?.ownerId === a.id) return -1;
          if (currentList?.ownerId === b.id) return 1;
          return a.name.localeCompare(b.name);
        })
        .map((member) => {
        const isOwner = currentList.ownerId === member.id;
        const canRemove = currentUserRole === 'Owner' && !isOwner;

        const joinDate = currentList?.memberIds.includes(member.id) 
          ? new Date(currentList.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Recently joined';

        return (
          <View key={member.id} style={styles.memberCard}>
            <View style={[styles.avatar, { backgroundColor: member.color }]}>
              {member.avatarUrl ? (
                <View style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                {isOwner && (
                  <View style={styles.ownerBadge}>
                    <Crown size={12} color="#F59E0B" />
                    <Text style={styles.ownerBadgeText}>Owner</Text>
                  </View>
                )}
              </View>
              {member.email && (
                <View style={styles.memberDetailRow}>
                  <Mail size={12} color="#9CA3AF" />
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              )}
              <View style={styles.memberDetailRow}>
                <Calendar size={12} color="#9CA3AF" />
                <Text style={styles.memberJoinDate}>Joined {joinDate}</Text>
              </View>
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

      {currentListMembers.filter((member) => 
        searchQuery === '' || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))
      ).length === 0 && searchQuery !== '' && (
        <View style={styles.emptySearch}>
          <UserIcon size={40} color="#D1D5DB" />
          <Text style={styles.emptySearchText}>No members found</Text>
          <Text style={styles.emptySearchSubtext}>Try a different search term</Text>
        </View>
      )}
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
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    gap: 8,
    marginBottom: 6,
  },
  ownerBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  memberDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 3,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  memberEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  memberJoinDate: {
    fontSize: 12,
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
  emptySearch: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
  },
  emptySearchText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 12,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
