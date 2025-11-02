import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Check, Search } from 'lucide-react-native';
import { ModalInputWrapper } from '@/components/ModalInputWrapper';

export interface Person {
  id: string;
  name: string;
  email?: string;
  avatarColor?: string;
}

interface PersonSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  people: Person[];
  selectedIds?: string[];
  multiSelect?: boolean;
  title?: string;
}

export function PersonSelectorModal({
  open,
  onClose,
  onConfirm,
  people,
  selectedIds = [],
  multiSelect = true,
  title = 'Assign To',
}: PersonSelectorModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePerson = (id: string) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    setSearchQuery('');
    setSelected(selectedIds);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelected(selectedIds);
    onClose();
  };

  return (
    <ModalInputWrapper
      open={open}
      title={title}
      subtitle={multiSelect ? 'Select one or more people' : 'Select a person'}
      onClose={handleClose}
      onConfirm={handleConfirm}
      testID="person-selector-modal"
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.list}>
          {filteredPeople.map((person) => {
            const isSelected = selected.includes(person.id);
            return (
              <TouchableOpacity
                key={person.id}
                style={[
                  styles.personItem,
                  isSelected && styles.personItemSelected,
                ]}
                onPress={() => togglePerson(person.id)}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: person.avatarColor || '#3B82F6' },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {person.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  {person.email && (
                    <Text style={styles.personEmail}>{person.email}</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selected.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selected.length} selected
            </Text>
          </View>
        )}
      </View>
    </ModalInputWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  list: {
    maxHeight: 300,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  personItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  personEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2F6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCount: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignSelf: 'center',
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
