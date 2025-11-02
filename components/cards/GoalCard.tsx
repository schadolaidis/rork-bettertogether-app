import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { Card } from '@/components/design-system/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { Circle, MoreVertical } from 'lucide-react-native';
import { Button } from '@/components/design-system/Button';

export type GoalCardProps = {
  title: string;
  subtitle: string;
  saved: number;
  target: number;
  onAddTask?: () => void;
  onViewTasks?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const GoalCard: React.FC<GoalCardProps> = ({ 
  title, 
  subtitle, 
  saved, 
  target,
  onAddTask,
  onViewTasks,
  onEdit,
  onDelete
}) => {
  const { theme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.();
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.();
  };

  return (
    <Card style={styles.container}>
      <View style={[styles.header, { marginBottom: theme.spacing.xs }]}>
        <View style={styles.headerLeft}>
          <Circle size={20} color={theme.colors.textLow} />
        </View>
        <View style={styles.headerRight}>
          <Text style={[theme.typography.Label, { color: theme.colors.textLow, marginRight: theme.spacing.xs }]}>
            ${saved} / ${target}
          </Text>
          <Pressable 
            onPress={handleMenuPress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && { opacity: 0.6 }
            ]}
          >
            <MoreVertical size={20} color={theme.colors.textLow} />
          </Pressable>
        </View>
      </View>
      
      <Text style={[theme.typography.H2, { color: theme.colors.textHigh, marginBottom: theme.spacing.xs }]}>
        {title}
      </Text>
      
      <Text style={[theme.typography.Caption, { color: theme.colors.textLow }]}>
        {subtitle}
      </Text>

      <View style={[styles.footer, { marginTop: theme.spacing.sm }]}>
        <View style={styles.footerButton}>
          <Button 
            title="+ Add Task" 
            variant="primary"
            onPress={onAddTask || (() => console.log('Add task'))} 
          />
        </View>
        <View style={[styles.footerButton, { marginLeft: theme.spacing.xs }]}>
          <Button 
            title="View Tasks" 
            variant="secondary"
            onPress={onViewTasks || (() => console.log('View tasks'))} 
          />
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleMenuClose}>
          <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { borderBottomColor: theme.colors.border },
                pressed && { backgroundColor: theme.colors.surfaceAlt }
              ]}
              onPress={handleEdit}
            >
              <Text style={[theme.typography.Body, { color: theme.colors.textHigh }]}>Edit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: theme.colors.surfaceAlt }
              ]}
              onPress={handleDelete}
            >
              <Text style={[theme.typography.Body, { color: theme.colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
});
