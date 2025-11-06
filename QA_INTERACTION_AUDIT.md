# QA Interaction Audit & Test Plan
## Scheduling Modal - DateTimePickerSheet Component

**Component Path:** `components/pickers/DateTimePickerSheet.tsx`  
**Test Date:** 2025-11-06  
**Tester:** QA Team  

---

## 1. NATURAL LANGUAGE INPUT FIELD ("Smart Field")

### 1.1 Smart Field Input Box
**Location:** Top of modal, prominent text input  
**Element ID:** `testID-natural-input`

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **1.1.1** Tap on input field | Keyboard appears; field gets focus | Border color changes from `theme.border` to `theme.primary` (2px) | ☐ |
| **1.1.2** Type "tomorrow 3pm" | Text appears in field | Parsed result appears below with clock icon showing "Thu, Nov 7, 2025 at 03:00 PM" | ☐ |
| **1.1.3** Type "next friday at 2:30" | Text appears in field | Parsed result updates; calendar auto-scrolls to that Friday | ☐ |
| **1.1.4** Type "in 2 hours" | Text appears in field | Parsed result shows date/time 2 hours from now | ☐ |
| **1.1.5** Type "dec 25 at 9am" | Text appears in field | Parsed result shows "Wed, Dec 25, 2024 at 09:00 AM"; calendar jumps to December | ☐ |
| **1.1.6** Type invalid text (e.g., "asdfghjkl") | Text appears in field | Red error text appears: "Can't understand that. Try 'tomorrow 3pm' or select from calendar below" | ☐ |
| **1.1.7** Clear input after successful parse | Field becomes empty | Parsed result disappears; helper text reappears with examples | ☐ |
| **1.1.8** Type partial date (e.g., "tomorrow") | Text appears | Parsed result shows "tomorrow" with "All day" time | ☐ |
| **1.1.9** Parse delay (300ms debounce) | Type quickly | Parsing only triggers after 300ms of no typing | ☐ |
| **1.1.10** Submit keyboard (press "Done") | Keyboard dismisses | No date change occurs (only "Done" button should apply changes) | ☐ |

### 1.2 Parsed Result Display
**Location:** Below smart field when parse succeeds  
**Visual:** Blue-tinted box with clock icon

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **1.2.1** Parsed result appears | Shows formatted date/time | Blue box with border, clock icon (blue), bold text | ☐ |
| **1.2.2** Calendar auto-updates | Calendar view changes month | Month/year in calendar header updates to match parsed date | ☐ |
| **1.2.3** Selected date highlights | Calendar day cell highlights | Day cell gets blue background (`theme.primary`) | ☐ |
| **1.2.4** All-day event detected | Parse "tomorrow" without time | Parsed result shows "All day" instead of time | ☐ |

### 1.3 Helper Text States
**Location:** Below smart field

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **1.3.1** Empty input | Shows example prompts | Gray text with examples: "tomorrow 3pm", "next friday at 2:30", etc. | ☐ |
| **1.3.2** Invalid input | Shows error message | Red text: "Can't understand that. Try 'tomorrow 3pm' or select from calendar below" | ☐ |
| **1.3.3** Valid parse | Helper text hidden | Only parsed result box visible | ☐ |

---

## 2. VISUAL CALENDAR

### 2.1 Calendar Navigation Controls
**Location:** Above calendar grid

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **2.1.1** Tap [<] (Previous Month) button | Calendar moves to previous month | Month/year text updates; grid redraws; haptic feedback on native | ☐ |
| **2.1.2** Tap [>] (Next Month) button | Calendar moves to next month | Month/year text updates; grid redraws; haptic feedback on native | ☐ |
| **2.1.3** Rapid month navigation | Tap multiple times quickly | Each tap registers; month updates sequentially | ☐ |
| **2.1.4** Month name display | Always shows current calendar month | Text shows "November 2025" format | ☐ |
| **2.1.5** Press state on nav buttons | Press and hold | Button opacity changes to 0.6 while pressed | ☐ |

### 2.2 Calendar Day Cells
**Location:** 7x6 grid of date cells

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **2.2.1** Tap valid future date | Date selected; updates state | Cell gets solid blue background; text turns white | ☐ |
| **2.2.2** Tap already selected date | Date remains selected | No visual change (already highlighted) | ☐ |
| **2.2.3** Tap different date (when one is selected) | New date selected; previous unhighlights | Old cell returns to normal; new cell highlights blue | ☐ |
| **2.2.4** Tap today's date (when not selected) | Today selected | Blue 2px border ring becomes solid blue fill | ☐ |
| **2.2.5** Today indicator (not selected) | Today has border ring | Blue 2px border ring; no fill | ☐ |
| **2.2.6** Tap past date (when `disablePast={true}`) | Nothing happens (disabled) | Cell opacity 0.3; no press state; no haptic | ☐ |
| **2.2.7** Tap past date (when `disablePast={false}`) | Date selected normally | Cell highlights; no restrictions | ☐ |
| **2.2.8** Days from other months | Greyed out, opacity 0.4 | Still tappable but visually de-emphasized | ☐ |
| **2.2.9** Press state on valid day | Press and hold | Background changes to `theme.surfaceAlt` | ☐ |
| **2.2.10** Haptic feedback (native only) | Tap any valid day | Medium impact haptic fires | ☐ |

### 2.3 Calendar Auto-Update from NLP
**Integration:** Smart field → Calendar

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **2.3.1** Type "tomorrow" in smart field | Calendar updates to tomorrow's month | If tomorrow is in next month, calendar auto-advances | ☐ |
| **2.3.2** Type "dec 25" in smart field | Calendar jumps to December | Month header shows "December 2024"; day 25 highlighted | ☐ |
| **2.3.3** Type "next year" date | Calendar jumps to 2026 | Year in header updates | ☐ |
| **2.3.4** Manual calendar selection after NLP parse | User taps different day | Smart field input NOT cleared; parsed result updates to show newly selected date | ☐ |

---

## 3. MAIN ACTION BUTTONS

### 3.1 Cancel Button
**Location:** Footer left

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **3.1.1** Tap Cancel | Modal closes; no changes saved | Opacity 0.6 on press; modal dismisses; `onClose()` called | ☐ |
| **3.1.2** Haptic on Cancel (native) | Light haptic feedback | Fires on button press | ☐ |
| **3.1.3** Changes discarded | Any unsaved selections lost | Original value unchanged in parent component | ☐ |

### 3.2 Done Button
**Location:** Footer right

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **3.2.1** Tap Done with selected date | Modal closes; date saved | Blue button opacity 0.8 on press; `onChange()` called with ISO string | ☐ |
| **3.2.2** Done with no date selected | Uses current date | No error; today's date used | ☐ |
| **3.2.3** Done with no time selected | Defaults to current time | If not all-day, current hours:minutes used | ☐ |
| **3.2.4** Done with all-day flag | ISO string has `T00:00:00` | Time portion set to midnight | ☐ |
| **3.2.5** Done with specific time from NLP | ISO string includes parsed time | Format: `YYYY-MM-DDTHH:MM:00` | ☐ |
| **3.2.6** Done with past date (when allowed) | Saves past date | No validation error | ☐ |
| **3.2.7** Haptic on Done (native) | Medium impact haptic | Fires on success | ☐ |
| **3.2.8** Console logging | Check dev console | Logs: `[DatePicker] Done pressed:` with full object | ☐ |

---

## 4. MODAL BEHAVIOR

### 4.1 Modal Open/Close
**Component:** ModalSheet wrapper

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **4.1.1** Modal opens with `visible={true}` | Sheet slides up from bottom | Smooth animation; backdrop appears | ☐ |
| **4.1.2** Initial state loads from `value` prop | Shows pre-selected date | Calendar highlights date; parsed state correct | ☐ |
| **4.1.3** Initial focus on smart field (if `initialFocus='date'`) | Keyboard appears immediately | Field auto-focused; cursor visible | ☐ |
| **4.1.4** Close button (X) in header | Modal closes | Same as Cancel; light haptic | ☐ |
| **4.1.5** Backdrop tap (if implemented) | Modal closes | Same as Cancel | ☐ |
| **4.1.6** State reset on reopen | Opens with latest `value` prop | Previous unsaved changes discarded | ☐ |

### 4.2 Scroll Behavior
**Component:** ScrollView container

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **4.2.1** Scroll content | Content scrollable | Smart field, divider, calendar, all scrollable | ☐ |
| **4.2.2** Keyboard open + smart field focused | Content adjusts | `keyboardShouldPersistTaps="handled"` allows taps while keyboard open | ☐ |
| **4.2.3** Tap calendar day while keyboard open | Day selects; keyboard stays open | No keyboard dismiss unless "Done" pressed on keyboard | ☐ |

---

## 5. EDGE CASES & CONFLICT SCENARIOS

### 5.1 Date/Time Conflicts

| Test Case | Scenario | Expected Behavior | Pass/Fail |
|-----------|----------|-------------------|-----------|
| **5.1.1** NLP parse + Manual selection | Type "tomorrow", then tap a different day | Smart field input NOT cleared; selected date = tapped day; parsed result updates or clears | ☐ |
| **5.1.2** Parse all-day + Select same day manually | Type "tomorrow" (all-day), tap tomorrow in calendar | `allDay` remains `true`; time stays `00:00` | ☐ |
| **5.1.3** Parse with time + Select different day | Type "tomorrow 3pm", tap next week | Time component LOST (POTENTIAL BUG); date updated; time unclear | ⚠️ |
| **5.1.4** Rapid input changes | Type, delete, type different phrase | Only final debounced result parsed (300ms) | ☐ |

### 5.2 Validation Edge Cases

| Test Case | Scenario | Expected Behavior | Pass/Fail |
|-----------|----------|-------------------|-----------|
| **5.2.1** Done with past date (`disablePast={true}`) | Select past date (if possible) + press Done | Should be blocked at selection level; button should not allow | ☐ |
| **5.2.2** Done without any interaction | Open modal, immediately press Done | Uses initial `value` prop if provided; or current date/time | ☐ |
| **5.2.3** Invalid ISO string in `value` prop | Parent passes malformed ISO string | Fallback to current date; logs warning to console | ☐ |
| **5.2.4** Type invalid date in NLP (e.g., "Feb 30") | chrono.js may parse or reject | Error message or no parse; check parsed result | ☐ |

### 5.3 Time Handling (NOTE: No time picker in current implementation)

| Test Case | Scenario | Expected Behavior | Pass/Fail |
|-----------|----------|-------------------|-----------|
| **5.3.1** Parse date-only phrase | Type "tomorrow" | `allDay` set to `true`; time = `00:00` | ☐ |
| **5.3.2** Parse date+time phrase | Type "tomorrow 5pm" | `allDay` set to `false`; time = `17:00` | ☐ |
| **5.3.3** Done without time selection | Select date via calendar; press Done | Uses current time if not all-day | ☐ |
| **5.3.4** No manual time input UI | Check modal | CONFIRMED: No time picker wheels/chips/input present | ✓ |

---

## 6. INTEGRATION TESTS (Cross-Component)

### 6.1 TaskFormModal → DateTimePickerSheet
**Parent Component:** `components/TaskFormModal.tsx`

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **6.1.1** Tap "Due Date & Time" card in TaskFormModal | DateTimePickerSheet opens | Modal slides up; shows current task date | ☐ |
| **6.1.2** Confirm date change in picker | TaskFormModal updates | Date card shows new formatted date; no console errors | ☐ |
| **6.1.3** Cancel picker | TaskFormModal unchanged | Original date preserved | ☐ |
| **6.1.4** Edit mode: Load existing task date | Picker opens with task's date | Calendar highlights correct date; smart field empty | ☐ |

### 6.2 TaskEditSheet → DateTimeInput → DateTimePickerSheet
**Parent Components:** `screens/TaskEditSheet.tsx` → `components/form/DateTimeInput.tsx`

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **6.2.1** Tap DateTimeInput field | DateTimePickerSheet opens | Seamless transition; correct initial value | ☐ |
| **6.2.2** Confirm selection | DateTimeInput displays formatted date | Format: "Wed, Nov 6, 2024, 03:00 PM" | ☐ |
| **6.2.3** Field error state propagation | If parent has error, input shows error | Red border or error text visible | ☐ |

---

## 7. ACCESSIBILITY & UX

| Test Case | Expected Behavior | Expected UI Feedback | Pass/Fail |
|-----------|-------------------|---------------------|-----------|
| **7.1** testID props present | All interactive elements have testIDs | Can locate elements in test automation | ☐ |
| **7.2** Haptic feedback (iOS/Android only) | All taps trigger appropriate haptics | Light/Medium impacts fire | ☐ |
| **7.3** Press states visible | All pressable elements have visual feedback | Opacity or background color changes | ☐ |
| **7.4** Text contrast | All text readable | High contrast ratios met | ☐ |
| **7.5** Touch target size | All buttons ≥44x44 pts | No tiny hit areas | ☐ |
| **7.6** Keyboard dismissal | Tapping outside input dismisses keyboard | Native behavior respected | ☐ |

---

## 8. KNOWN ISSUES & BUGS (From Previous Messages)

### 8.1 Reported Issues

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| **BUG-001** | Time selection method removed (no wheels/chips) | RESOLVED | Keyboard-first design implemented ✓ |
| **BUG-002** | Fund goals edit doesn't work (previous message) | HIGH | TO BE INVESTIGATED |
| **CONCERN-001** | Time component may be lost when manually selecting date after NLP parse with time | MEDIUM | NEEDS TESTING (5.1.3) |
| **CONCERN-002** | No visual feedback when typing in smart field before parse completes | LOW | By design (300ms debounce) |

---

## 9. CROSS-BROWSER/PLATFORM TESTING

| Platform | Test Status | Notes |
|----------|-------------|-------|
| iOS Physical Device | ☐ | Test haptics, keyboard behavior |
| Android Physical Device | ☐ | Test haptics, keyboard behavior |
| Web (Chrome) | ☐ | Haptics disabled; keyboard behavior differs |
| Web (Safari) | ☐ | Date parsing compatibility |
| Web (Firefox) | ☐ | ScrollView behavior |

---

## 10. PERFORMANCE TESTS

| Test Case | Expected Behavior | Pass/Fail |
|-----------|-------------------|-----------|
| **10.1** Rapid typing in smart field | No lag; debounce prevents excessive parsing | ☐ |
| **10.2** Fast month navigation | Calendar renders smoothly | ☐ |
| **10.3** Open/close modal repeatedly | No memory leaks; state resets correctly | ☐ |
| **10.4** Large date range (e.g., year 2050) | Calendar still functional | ☐ |

---

## SUMMARY CHECKLIST

### Critical Path (Must Pass)
- [ ] Smart field accepts input and parses correctly
- [ ] Parsed date highlights in calendar
- [ ] Calendar day selection works
- [ ] Done button saves selection
- [ ] Cancel button discards changes
- [ ] Modal opens/closes without crashes

### High Priority (Should Pass)
- [ ] Month navigation works
- [ ] Past date blocking (when enabled)
- [ ] All-day vs timed events handled
- [ ] Error messages display correctly
- [ ] Integration with parent forms works

### Medium Priority (Nice to Have)
- [ ] Haptics fire correctly on native
- [ ] Helper text updates properly
- [ ] Console logging aids debugging
- [ ] Press states visible

### Low Priority (Enhancements)
- [ ] Animation smoothness
- [ ] Accessibility improvements
- [ ] Edge case handling

---

## TEST EXECUTION LOG

**Tester Name:** _______________  
**Date:** _______________  
**Build Version:** _______________  

**Overall Status:**  
☐ PASS  
☐ FAIL (See issues below)  
☐ BLOCKED  

**Critical Bugs Found:**
1. _________________________________
2. _________________________________
3. _________________________________

**Notes:**
_________________________________________
_________________________________________
_________________________________________

---

## RECOMMENDED NEXT STEPS

Based on this audit, the following actions are recommended:

1. **INVESTIGATE BUG-002:** "Fund goals edit doesn't work"
   - Test fund target selection in TaskFormModal
   - Verify `setSelectedFundTarget()` state updates
   - Check if `showFundTargetPicker` modal opens

2. **TEST CONCERN-001:** Time persistence issue
   - Type "tomorrow 5pm" → Verify time stored
   - Manually tap different date → Check if time preserved or lost
   - Expected: Time should persist or prompt user

3. **VERIFY testID coverage**
   - Ensure all interactive elements have testID props
   - Update automation scripts if needed

4. **Cross-platform validation**
   - Test on real iOS/Android devices (not just simulators)
   - Web testing across browsers

5. **Load testing**
   - Test with very far future dates (2050+)
   - Test with rapid user interactions

---

**END OF AUDIT DOCUMENT**
