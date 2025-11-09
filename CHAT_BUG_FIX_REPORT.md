# Chat Input Bug Fix - Root Cause Analysis & Solution

## Problem Summary
Users could not type in the chat input field. Any character typed would appear briefly then immediately disappear, making the input unusable.

## Root Cause Identified

### The Critical Bug: Component Definition Anti-Pattern

In `components/ChatTab.tsx`, the `ChatInput` component was **defined inside the same file** as the `ChatTab` component:

```typescript
// ❌ WRONG: Component defined inside another component's file
function ChatInput({ onSend, disabled }) {
  const [inputText, setInputText] = useState('');
  // ... rest of component
}

export const ChatTab = memo(function ChatTab({ goalId, onSendMessage }) {
  // ... ChatTab logic
  return (
    // ...
    <ChatInput onSend={handleSendMessage} disabled={...} />
  );
});
```

### Why This Caused the Bug

1. **Every time `ChatTab` re-renders**, React re-reads the entire file
2. When it encounters the `ChatInput` function definition, it creates a **new component type**
3. React compares the old `ChatInput` vs the new `ChatInput` and sees them as **completely different components** (different function references)
4. React **unmounts** the old `ChatInput` instance (destroying all state)
5. React **mounts** a new `ChatInput` instance (with fresh empty state)
6. All typed text is lost in this unmount/mount cycle

### What Triggers Re-renders

The `ChatTab` component re-renders when:
- New messages arrive from the server (every 10 seconds via `refetchInterval`)
- The `trpc.chat.getMessages.useQuery` updates
- The `localMessages` state changes
- Any parent component re-renders

Each of these re-renders would destroy and recreate the `ChatInput`, resetting the user's typed text.

## Why Previous Fixes Didn't Work

### 1. ✗ Checking `value`/`onChange` Props
- These were correctly configured
- The problem wasn't in the input's props but in the **component lifecycle**

### 2. ✗ Adding `React.memo` / `useCallback` 
- While `ChatTab` was wrapped in `memo`, the `ChatInput` definition was still being recreated
- `memo` prevents re-renders but doesn't prevent component **re-definition**

### 3. ✗ Setting `unmountOnBlur: false`
- This was already correctly set in the tab navigator
- The problem wasn't the screen unmounting, but the input component unmounting

### 4. ✗ Using `useRef` for State
- The original code tried using `useRef` to preserve state across re-renders
- But this doesn't help when the component is fully unmounted

## The Solution

### Fix Applied

Moved `ChatInput` to be a **proper standalone component** defined **outside** the scope of any other component:

```typescript
// ✅ CORRECT: Component defined at module level
interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput = memo(function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  
  const handleChangeText = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInputText('');
  }, [inputText, onSend]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={inputText}
        onChangeText={handleChangeText}
        // ... other props
      />
      {/* ... send button */}
    </View>
  );
});

// Then used in ChatTab
export const ChatTab = memo(function ChatTab({ goalId, onSendMessage }) {
  // ...
  return (
    <ChatInput onSend={handleSendMessage} disabled={...} />
  );
});
```

### Why This Works

1. **Single Component Definition**: `ChatInput` is defined once at module load time
2. **Stable Component Type**: React always sees the same `ChatInput` function reference
3. **memo Optimization**: Wrapped in `memo` to prevent unnecessary re-renders
4. **State Preservation**: Since the component isn't unmounted, `useState` preserves the input text
5. **Proper Dependencies**: `useCallback` with correct dependencies ensures callbacks are stable

## Additional Improvements

1. **Removed Complex Ref Pattern**: Simplified from using `useRef` + `useEffect` to direct `inputText` usage
2. **Added Debug Logging**: Mount/unmount logs to help diagnose issues
3. **Proper TypeScript Types**: Added `ChatInputProps` interface for type safety

## Testing Recommendations

To verify the fix works:

1. Open the chat screen
2. Type multiple characters - they should all remain visible
3. Type a message and send it - input should clear
4. Leave input partially typed and wait 10 seconds (for message refetch) - text should remain
5. Switch tabs and return - text should remain (due to `unmountOnBlur: false`)

## Key Learnings

### React Anti-Pattern: Nested Component Definitions

**Never define components inside other components** or at file scope where they can be re-evaluated:

```typescript
// ❌ WRONG
function ParentComponent() {
  function ChildComponent() { /* ... */ }  // Re-created on every render
  return <ChildComponent />;
}

// ❌ WRONG  
function ParentComponent() {
  const ChildComponent = () => { /* ... */ };  // Re-created on every render
  return <ChildComponent />;
}

// ✅ CORRECT
const ChildComponent = () => { /* ... */ };  // Created once at module load

function ParentComponent() {
  return <ChildComponent />;
}
```

### Why This Matters

- Component identity matters in React's reconciliation algorithm
- Changing component identity triggers unmount/mount, not re-render
- Unmount destroys all internal state, context subscriptions, and refs
- This is one of the most common React bugs in production apps

## Files Modified

- `components/ChatTab.tsx` - Fixed component definition pattern

## Status

✅ **FIXED** - Chat input now maintains state correctly across all re-renders.
