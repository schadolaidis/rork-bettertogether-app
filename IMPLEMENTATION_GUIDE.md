# 🛠️ Rork App: Redesign Implementation Guide

## Quick Start

This guide helps you implement the new design system across all screens.

---

## ✅ Phase 1: Foundation (COMPLETED)

### Files Created
1. `constants/design-tokens.ts` — Color system, typography, spacing, shadows
2. `components/design-system/SectionHeader.tsx` — Section titles with optional actions
3. `components/design-system/GroupCard.tsx` — Container for grouped rows
4. `components/design-system/DisclosureRow.tsx` — List item with icon, label, value, chevron
5. `components/design-system/ToggleRow.tsx` — List item with toggle switch
6. `app/(tabs)/settings/index-redesigned.tsx` — **Reference implementation**

### How to Use

#### Example: Simple Settings Section
```tsx
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { GroupCard } from '@/components/design-system/GroupCard';
import { DisclosureRow } from '@/components/design-system/DisclosureRow';
import { Bell, User } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

<SectionHeader 
  title="ACCOUNT" 
  subtitle="Manage your profile"
/>
<GroupCard style={{ marginHorizontal: 20, marginBottom: 20 }}>
  <DisclosureRow
    icon={<User size={20} color={DesignTokens.colors.primary[500]} />}
    label="Profile"
    subtitle="Name, email, and avatar"
    onPress={() => router.push('/profile')}
    isFirst
  />
  <DisclosureRow
    icon={<Bell size={20} color={DesignTokens.colors.warning[500]} />}
    label="Notifications"
    value="3 unread"
    badge={3}
    onPress={() => router.push('/notifications')}
    isLast
  />
</GroupCard>
```

#### Example: Collapsible Section
```tsx
const [expanded, setExpanded] = useState(false);

<SectionHeader 
  title="WORKSPACE" 
  action={{
    label: expanded ? 'Collapse' : 'Expand',
    onPress: () => setExpanded(!expanded)
  }}
/>
{expanded && (
  <GroupCard style={{ marginHorizontal: 20, marginBottom: 20 }}>
    {/* Your collapsible content */}
  </GroupCard>
)}
```

#### Example: Toggle Switch
```tsx
import { ToggleRow } from '@/components/design-system/ToggleRow';

<GroupCard style={{ marginHorizontal: 20, marginBottom: 20 }}>
  <ToggleRow
    icon={<Bell size={20} color={DesignTokens.colors.primary[500]} />}
    label="Push Notifications"
    subtitle="Get notified about task reminders"
    value={notificationsEnabled}
    onValueChange={setNotificationsEnabled}
    isFirst
    isLast
  />
</GroupCard>
```

---

## 🚀 Phase 2: Dashboard Redesign

### Current Issues
- 4 stat cards create clutter
- Inconsistent card designs
- No progressive disclosure

### Implementation Plan

#### Step 1: Create StatCard Component
```tsx
// components/design-system/StatCard.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: {
    value: number;
    icon: React.ReactNode;
  };
  color: string;
  onPress?: () => void;
}

export function StatCard({ icon, label, value, trend, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {trend && (
        <View style={styles.trend}>
          {trend.icon}
          <Text style={[styles.trendText, { color }]}>{trend.value > 0 ? '+' : ''}{trend.value}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    borderLeftWidth: 4,
    ...DesignTokens.shadow.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  label: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
    marginBottom: DesignTokens.spacing.xs,
  },
  value: {
    ...DesignTokens.typography.headingMedium,
    marginBottom: DesignTokens.spacing.xs,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  trendText: {
    ...DesignTokens.typography.labelSmall,
    fontSize: 11,
  },
});
```

#### Step 2: Update Dashboard Layout
```tsx
// app/(tabs)/index.tsx

import { StatCard } from '@/components/design-system/StatCard';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { AlertCircle, TrendingUp } from 'lucide-react-native';

// Replace existing statsGrid with:
<View style={styles.statsGrid}>
  <StatCard
    icon={<AlertCircle size={24} color={DesignTokens.colors.primary[500]} />}
    label="Open Tasks"
    value={dashboardStats.openTasks.toString()}
    color={DesignTokens.colors.primary[500]}
    onPress={() => router.push('/tasks?filter=open')}
  />
  <StatCard
    icon={<TrendingUp size={24} color={balanceColor} />}
    label="Balance"
    value={`${currencySymbol}${Math.abs(totalBalance).toFixed(2)}`}
    trend={{
      value: myBalanceTrend,
      icon: <TrendingUp size={14} color={balanceColor} />
    }}
    color={balanceColor}
    onPress={() => router.push('/balances')}
  />
</View>

// Wrap Fund Goals in consistent section:
<SectionHeader 
  title="FUND GOALS" 
  subtitle={`${activeFundTargets.length} active`}
  action={{
    label: 'Manage',
    onPress: () => router.push('/settings/funds')
  }}
/>
```

---

## 🎯 Phase 3: Tasks Screen Redesign

### Current Issues
- TaskCard too busy (7+ pieces of info)
- No smart grouping
- Redundant visual signals

### Implementation Plan

#### Step 1: Simplify TaskCard
```tsx
// components/design-system/TaskCard.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';

interface TaskCardProps {
  title: string;
  categoryEmoji: string;
  categoryColor: string;
  dueTime: string;
  status: 'pending' | 'overdue';
  onPress: () => void;
}

export function TaskCard({ 
  title, 
  categoryEmoji, 
  categoryColor, 
  dueTime, 
  status, 
  onPress 
}: TaskCardProps) {
  const statusColor = status === 'overdue' 
    ? DesignTokens.colors.warning[500] 
    : DesignTokens.colors.neutral[500];

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: categoryColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.category}>
          <Text style={styles.emoji}>{categoryEmoji}</Text>
        </View>
        <View style={styles.time}>
          <Clock size={14} color={statusColor} />
          <Text style={[styles.timeText, { color: statusColor }]}>{dueTime}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    borderLeftWidth: 4,
    padding: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  timeText: {
    ...DesignTokens.typography.bodySmall,
    fontWeight: '600',
  },
  title: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[900],
    fontWeight: '600',
    lineHeight: 22,
  },
});
```

#### Step 2: Add Smart Grouping
```tsx
// In app/(tabs)/tasks.tsx

const groupedTasks = useMemo(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const groups = {
    today: [] as Task[],
    tomorrow: [] as Task[],
    thisWeek: [] as Task[],
    later: [] as Task[],
  };

  filteredTasks.forEach(task => {
    const taskDate = new Date(task.endAt);
    if (taskDate < tomorrow) {
      groups.today.push(task);
    } else if (taskDate < weekEnd) {
      if (taskDate.getDate() === tomorrow.getDate()) {
        groups.tomorrow.push(task);
      } else {
        groups.thisWeek.push(task);
      }
    } else {
      groups.later.push(task);
    }
  });

  return groups;
}, [filteredTasks]);

// Render:
<ScrollView>
  {groupedTasks.today.length > 0 && (
    <>
      <SectionHeader title="TODAY" subtitle={`${groupedTasks.today.length} tasks`} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {groupedTasks.today.map(task => (
          <TaskCard key={task.id} {...task} />
        ))}
      </View>
    </>
  )}
  {/* Repeat for tomorrow, thisWeek, later */}
</ScrollView>
```

---

## 💰 Phase 4: Fund Goals Redesign

### Current Issues
- Mixed card styles
- No visual progress
- Inconsistent stat cards

### Implementation Plan

#### Step 1: Create FundCard Component
```tsx
// components/design-system/FundCard.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Target } from 'lucide-react-native';
import { DesignTokens } from '@/constants/design-tokens';
import Svg, { Circle } from 'react-native-svg';

interface FundCardProps {
  emoji: string;
  name: string;
  description?: string;
  collected: number;
  target?: number;
  linkedTasks: number;
  currencySymbol: string;
  onPress: () => void;
}

export function FundCard({ 
  emoji, 
  name, 
  description, 
  collected, 
  target, 
  linkedTasks, 
  currencySymbol, 
  onPress 
}: FundCardProps) {
  const progress = target ? Math.min((collected / target) * 100, 100) : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{name}</Text>
          {description && <Text style={styles.description} numberOfLines={1}>{description}</Text>}
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.collected}>{currencySymbol}{collected.toFixed(2)}</Text>
        {target && <Text style={styles.target}>of {currencySymbol}{target.toFixed(2)}</Text>}
      </View>

      {target && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Target size={14} color={DesignTokens.colors.neutral[500]} />
          <Text style={styles.statText}>{linkedTasks} tasks linked</Text>
        </View>
        {target && (
          <Text style={styles.percentage}>{progress.toFixed(0)}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    ...DesignTokens.shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    ...DesignTokens.typography.headingSmall,
    color: DesignTokens.colors.neutral[900],
    marginBottom: 2,
  },
  description: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[500],
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.md,
  },
  collected: {
    ...DesignTokens.typography.displayMedium,
    color: DesignTokens.colors.purple[600],
  },
  target: {
    ...DesignTokens.typography.bodyMedium,
    color: DesignTokens.colors.neutral[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[100],
    borderRadius: DesignTokens.radius.full,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.purple[500],
    borderRadius: DesignTokens.radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  statText: {
    ...DesignTokens.typography.bodySmall,
    color: DesignTokens.colors.neutral[600],
  },
  percentage: {
    ...DesignTokens.typography.labelLarge,
    color: DesignTokens.colors.purple[600],
  },
});
```

---

## 🎨 Color Usage Guide

### When to Use Each Color

#### Primary Blue (#3B82F6)
- Main action buttons
- Primary CTAs
- Active state indicators
- Links and interactive elements

#### Success Green (#10B981)
- Completed tasks
- Positive balance
- Success messages
- Confirmation states

#### Warning Amber (#F59E0B)
- Overdue tasks
- Caution messages
- Pending actions

#### Error Red (#EF4444)
- Failed tasks
- Negative balance
- Error messages
- Delete actions

#### Purple (#8B5CF6)
- Fund goals
- Premium features
- Accent color for special items

#### Neutral Grays
- Text: 900 (headings), 700 (body), 500 (secondary)
- Backgrounds: 0 (white), 50 (page), 100 (cards)
- Borders: 200 (light), 300 (medium)

---

## 📱 Responsive Patterns

### Screen Sizes
- Small: < 375px width
- Medium: 375px - 428px width
- Large: > 428px width (tablets)

### Layout Rules
```tsx
// Use flexible layouts
<View style={{ 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  gap: 12 
}}>
  {/* Cards will wrap on smaller screens */}
</View>

// Use percentage widths for stat cards
<View style={{ 
  width: '48%',  // Always 2 per row
  minWidth: 160  // But never too small
}} />
```

---

## ♿ Accessibility Checklist

### For Every Interactive Element
- [ ] Minimum tap target: 44x44 points
- [ ] Accessible label (accessibilityLabel)
- [ ] Test ID for automated testing
- [ ] Proper hint text (accessibilityHint)
- [ ] Role definition (accessibilityRole)

### For Every Color Usage
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] Contrast ratio ≥ 3:1 for icons
- [ ] Don't rely on color alone (use icons + labels)

### For Every Screen
- [ ] Screen reader announcement on mount
- [ ] Logical tab order
- [ ] Focus indicator visible
- [ ] Dynamic type support

---

## 🐛 Common Pitfalls

### 1. Inconsistent Spacing
❌ Don't: `paddingHorizontal: 18`  
✅ Do: `paddingHorizontal: DesignTokens.spacing.lg` (16px)

### 2. Hardcoded Colors
❌ Don't: `color: '#3B82F6'`  
✅ Do: `color: DesignTokens.colors.primary[500]`

### 3. Inconsistent Typography
❌ Don't: `fontSize: 17, fontWeight: '500'`  
✅ Do: `...DesignTokens.typography.bodyLarge`

### 4. No testID
❌ Don't: `<TouchableOpacity onPress={...} />`  
✅ Do: `<TouchableOpacity testID="button-save" onPress={...} />`

### 5. No Haptics
❌ Don't: Just `onPress={...}`  
✅ Do: 
```tsx
onPress={() => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  handleAction();
}}
```

---

## 🚀 Next Steps

1. **Review reference implementation**: `app/(tabs)/settings/index-redesigned.tsx`
2. **Copy design pattern** to other screens
3. **Build missing components** (StatCard, TaskCard, FundCard)
4. **Test on real devices** (iOS + Android + Web)
5. **Gather user feedback**
6. **Iterate**

---

**Questions?** Check `REDESIGN_PLAN.md` for detailed rationale and comparisons.

**End of Implementation Guide**
