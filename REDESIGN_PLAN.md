# 🎨 Rork App: Complete UX Audit & Redesign Plan

## Executive Summary

This document provides a comprehensive UX evaluation and redesign strategy for the Rork app, benchmarked against industry leaders: **Notion**, **Revolut**, **YNAB**, **Todoist**, and **Things 3**.

**Current State:** Good functionality, inconsistent design patterns, unclear information hierarchy  
**Goal:** Unified, cohesive design system with exceptional mobile-first UX  
**Timeline:** Phased rollout over 3-4 sprints  

---

## 📊 Screen-by-Screen Audit

### 1. Dashboard (index.tsx) — Score: 6.5/10

#### Strengths
✅ Clear welcome greeting with user avatar  
✅ FundHero component has strong visual presence  
✅ List switcher is accessible  

#### Critical Issues
❌ **StatCards use inconsistent background patterns** vs rest of app  
❌ **Four-card grid creates visual clutter** — too much at once  
❌ **No clear visual hierarchy** — everything screams equally  
❌ **Fund goals section lacks consistency** with stats  
❌ **Empty state is weak** — just centered text + icon  

#### Comparison to Reference Apps
- **Notion** groups related items with clear segmentation  
- **Revolut** uses progressive disclosure (show summary → tap for detail)  
- **Rork** shows everything at once  

#### Recommendations
1. **Reduce stat cards to 2 primary metrics** (Open Tasks + Balance) above the fold
2. **Use progressive disclosure** — tap stat card to see breakdown
3. **Standardize card anatomy** — all cards use same border radius, shadow, padding
4. **Improve empty state** — add illustration + contextual CTA
5. **Group fund goals visually** — use consistent card design

---

### 2. Tasks Screen — Score: 5/10

#### Strengths
✅ Focus Goals horizontal scroll is intuitive  
✅ Quick action buttons (Complete/Fail) are immediately visible  
✅ Undo bar is well-designed  

#### Critical Issues
❌ **TaskCard shows too much metadata** (time, status, assignee, stake, fund banner)  
❌ **Redundant signals**: status badge + colored border + colored dot  
❌ **No grouping by priority or urgency** (Today, Tomorrow, Upcoming)  
❌ **Filter chips feel tacked on**, not integrated  
❌ **"Next Due" bar adds clutter**  
❌ **FAB + header "+" button** = two competing CTAs  

#### Comparison to Reference Apps
- **Todoist** shows: Title → Due date → Project tag. That's it.  
- **Things 3** uses visual weight to distinguish urgent from casual  
- **Rork** tries to show everything upfront → cognitive overload  

#### Recommendations
1. **Collapse secondary info** — show title + due time + category only
2. **Add "Tap to expand" behavior** — secondary info (stake, assignee) in detail view
3. **Group by smart sections**: "Today" → "Tomorrow" → "This Week" → "Later"
4. **Remove redundant visual signals** — pick ONE: either colored border OR status badge
5. **Remove "Next Due" bar** — it's redundant with grouped sections
6. **Keep only ONE create button** — either FAB or header +, not both

---

### 3. Fund Goals (balances.tsx) — Score: 6/10

#### Strengths
✅ Tab system (Overview/History/Stats) is smart  
✅ Member balance cards are readable  
✅ Fund card with dark gradient stands out  

#### Critical Issues
❌ **Mixing emoji + icon** in same title section  
❌ **Stat cards differ from Dashboard stats** (inconsistent)  
❌ **Category breakdown cards don't match member cards**  
❌ **"Insights" section feels like afterthought**  
❌ **No visual connection** between fund total and individual contributions  

#### Comparison to Reference Apps
- **YNAB** shows progress as primary UI element (bars, rings, completion %)  
- **Revolut Vaults** use consistent card anatomy: icon + name + amount + progress  
- **Rork** mixes too many card styles in one screen  

#### Recommendations
1. **Standardize all cards** — use same design system (GroupCard + DisclosureRow)
2. **Show fund progress visually** — circular progress or horizontal bar
3. **Connect fund to tasks** — "X tasks linked to this goal"
4. **Unify stat card design** across Dashboard and Balances
5. **Improve insights section** — make it actionable, not just informational

---

### 4. Settings Screen — Score: 7/10

#### Strengths
✅ Profile card at top is good  
✅ Grouping by sections (Account, Workspace, About) makes sense  
✅ Icon + label + chevron pattern is standard  

#### Critical Issues
❌ **Workspace card uses different styling** than other rows  
❌ **List picker dropdown feels like web UI**, not mobile  
❌ **No badges or status indicators** (e.g., "2 notifications unread")  
❌ **Spacing between sections is inconsistent**  

#### Comparison to Reference Apps
- **Notion** uses collapsible sections for advanced settings  
- **Revolut** uses disclosure indicators consistently  
- **Rork** settings are flat, no layering of complexity  

#### Recommendations
1. ✅ **IMPLEMENTED** — Use new design system (SectionHeader + GroupCard + DisclosureRow)
2. ✅ **IMPLEMENTED** — Collapsible workspace switcher
3. **Add badges** for unread notifications, pending invites
4. **Add subtle animations** on row tap

---

### 5. Calendar/Timeline Screen — Score: 7.5/10

#### Strengths
✅ Timeline with dots + connecting line is excellent  
✅ Task cards are cleaner than Tasks screen  
✅ Date grouping ("Today", "Tomorrow") is intuitive  

#### Critical Issues
❌ **Different color scheme** (#F8FAFC vs #F9FAFB everywhere else)  
❌ **Task card design here differs from Tasks screen**  
❌ **No week/month toggle** (title says "Timeline" but no view options)  

#### Recommendations
1. **Unify background color** — use neutral[50] everywhere
2. **Adopt Timeline task card design** for Tasks screen too
3. **Add view switcher** — Day / Week / Month
4. **Keep timeline visual** — it's the best part of this screen

---

## 🎨 Design System Implementation

### Phase 1: Foundation (Week 1) ✅ COMPLETED
- [x] Create design tokens (`constants/design-tokens.ts`)
- [x] Build atomic components:
  - [x] SectionHeader
  - [x] GroupCard
  - [x] DisclosureRow
  - [x] ToggleRow
- [x] Implement redesigned Settings screen as reference

### Phase 2: Core Screens (Week 2-3)
- [ ] Redesign Dashboard:
  - [ ] Reduce stat cards to 2 primary + progressive disclosure
  - [ ] Standardize FundHero design
  - [ ] Improve empty states
- [ ] Redesign Tasks:
  - [ ] Collapse task card metadata
  - [ ] Add smart grouping (Today / Tomorrow / Later)
  - [ ] Remove redundant CTAs
  - [ ] Unify with Timeline card design
- [ ] Redesign Fund Goals:
  - [ ] Unify card styles
  - [ ] Add progress visualization
  - [ ] Improve insights section

### Phase 3: Components (Week 3-4)
- [ ] Build shared components:
  - [ ] StatCard (unified across Dashboard + Balances)
  - [ ] TaskCard (unified across Tasks + Calendar)
  - [ ] FundCard (consistent design)
  - [ ] ProgressRing (for fund goals)
  - [ ] EmptyState (illustration + CTA)
- [ ] Create component library documentation

### Phase 4: Polish (Week 4)
- [ ] Add micro-interactions:
  - [ ] Button press animations
  - [ ] Card expansion animations
  - [ ] Tab transitions
- [ ] Accessibility audit:
  - [ ] Test screen readers
  - [ ] Verify tap target sizes (min 44x44)
  - [ ] Check color contrast ratios
- [ ] Dark mode support (future)

---

## 🎯 Key Design Principles

### 1. Mobile-First
- **Large tap targets** (min 44x44)
- **Thumb-friendly navigation** (bottom tabs, reachable CTAs)
- **Gesture support** (swipe to delete, pull to refresh)

### 2. Progressive Disclosure
- **Show essentials first**, hide details until needed
- **Tap to expand** — don't overwhelm with info
- **Contextual actions** — show actions relevant to current state

### 3. Visual Hierarchy
- **Typography scale** — use consistent font sizes (displayLarge → bodySmall)
- **Color meaning** — primary for action, success for positive, error for negative
- **Spacing rhythm** — consistent padding/margins (8, 12, 16, 20, 24, 32)

### 4. Consistency
- **One card style** — GroupCard for all grouped content
- **One row style** — DisclosureRow for all list items
- **One color palette** — DesignTokens.colors.*
- **One shadow system** — DesignTokens.shadow.*

---

## 📐 Component Anatomy

### GroupCard
```
┌─────────────────────────────┐
│                             │ ← 16px padding
│  ┌─────────────────────┐   │
│  │ DisclosureRow       │   │ ← 12px vertical padding
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ DisclosureRow       │   │ ← 1px border between rows
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### DisclosureRow
```
┌─────────────────────────────────────┐
│  [icon]  Label          Value  >    │ ← 40px icon + 12px spacing
│          Subtitle                   │ ← Optional subtitle
└─────────────────────────────────────┘
```

### SectionHeader
```
SECTION TITLE                 Action >
Optional subtitle
```

---

## 🚀 Migration Strategy

### Step 1: Settings (Reference Implementation)
✅ Settings screen is now the **gold standard**  
✅ All future screens should follow this pattern  
✅ File: `app/(tabs)/settings/index-redesigned.tsx`  

### Step 2: Dashboard
- Replace current stat cards with new StatCard component
- Wrap sections in GroupCard
- Use SectionHeader for "Your Fund Goals"

### Step 3: Tasks
- Simplify TaskCard to show: title + due + category
- Add expansion behavior for full details
- Group by smart sections

### Step 4: Fund Goals
- Unify all card designs
- Replace custom stat cards with shared StatCard
- Improve progress visualization

---

## 📊 Success Metrics

### UX Metrics
- **Task completion time** ↓ 30%
- **User taps to complete action** ↓ 25%
- **User comprehension score** (first-time users) ↑ 40%

### Technical Metrics
- **Component reuse** ↑ 80% (from 40%)
- **Design consistency score** ↑ 95% (from 60%)
- **Accessibility score** ↑ 100% (AAA contrast, screen reader support)

---

## 🎨 Visual References

### Color System
```
Primary: #3B82F6 (Blue 500)
Success: #10B981 (Green 500)
Warning: #F59E0B (Amber 500)
Error: #EF4444 (Red 500)
Purple: #8B5CF6 (Purple 500)
Neutral: #111827 → #F9FAFB (Gray 900 → 50)
```

### Typography Scale
```
Display Large: 32px / 800 weight / -0.5 tracking
Display Medium: 28px / 700 weight / -0.3 tracking
Heading Large: 24px / 700 weight
Heading Medium: 20px / 700 weight
Heading Small: 18px / 600 weight
Body Large: 17px / 500 weight
Body Medium: 15px / 500 weight
Body Small: 13px / 500 weight
Label Large: 14px / 600 weight
Label Small: 12px / 600 weight / UPPERCASE
```

### Spacing System
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
xxl: 24px
xxxl: 32px
```

### Border Radius
```
sm: 8px
md: 12px
lg: 16px
xl: 20px
xxl: 24px
full: 9999px
```

---

## 🔧 Next Steps

1. **Review this document** with the team
2. **Approve design system** (DesignTokens + atomic components)
3. **Start Phase 2** — Dashboard redesign
4. **Create Figma mockups** (optional but recommended)
5. **Iterate based on user feedback**

---

## 📚 Reference Apps

### Notion Mobile
- Clean section grouping
- Collapsible advanced settings
- Minimal visual noise

### Revolut App
- Modular card layout
- Strong visual segmentation
- Progressive disclosure

### YNAB
- Progress as primary UI
- Motivational design
- Clear goal visualization

### Todoist
- Task-centric minimalism
- Smart grouping (Today / Tomorrow)
- Fast task creation

### Things 3
- Calm, uncluttered layout
- Perfect whitespace
- Tactile micro-interactions

---

**End of Redesign Plan**  
Document created: 2025-01-02  
Last updated: 2025-01-02  
Version: 1.0  
