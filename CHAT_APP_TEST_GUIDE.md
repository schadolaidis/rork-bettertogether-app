# Chat App Testing Guide

## Quick Test Checklist

### 🔍 Pre-Test Setup
1. **Start the app**: `bun start`
2. **Check console**: Look for these success messages:
   ```
   [tRPC] Using configured base URL: <your-url>
   [Hono] Incoming request: GET <url>
   [tRPC Provider] Response: 200 OK
   ```

### ✅ Basic Functionality Tests

#### Test 1: Navigate to Chat Tab
**Steps**:
1. Open the app
2. Navigate to Chat tab
3. Verify you see the list of fund goals

**Expected Result**:
- Fund goals list displays
- Each fund shows emoji, name, and amount
- No errors in console

**Console Logs to Expect**:
```
[ChatScreen] Mounted
```

---

#### Test 2: Open a Fund Chat
**Steps**:
1. Tap on any fund goal
2. Wait for chat to load

**Expected Result**:
- Chat header appears with fund emoji and name
- Back button is visible
- Empty state shows "No messages yet" (if no messages)
- OR existing messages load (if messages exist)

**Console Logs to Expect**:
```
[tRPC Client] Request: <url>/api/trpc/chat.getMessages
[Chat getMessages] Input: {"goalId":"...","listId":"..."}
[Chat getMessages] Success: Found 0 messages
[tRPC Client] Response: 200 OK
```

---

#### Test 3: Send First Message
**Steps**:
1. Type "Hello team!" in the input
2. Tap the send button

**Expected Result**:
- Message appears immediately (optimistic update)
- Message shows "You" as sender
- Timestamp is current time
- Input clears after sending

**Console Logs to Expect**:
```
[ChatInput] Sending: Hello team!
[ChatTab] Adding optimistic message: temp-1234567890
[tRPC Client] Request: <url>/api/trpc/chat.sendMessage
[Chat sendMessage] Input: {"goalId":"...","senderId":"...","content":"Hello team!","listId":"..."}
[Chat sendMessage] Success: msg-1234567890-abc123
[tRPC Client] Response: 200 OK
[ChatTab] Message sent successfully: msg-1234567890-abc123
```

---

#### Test 4: Send Multiple Messages
**Steps**:
1. Send "Message 1"
2. Send "Message 2"
3. Send "Message 3"

**Expected Result**:
- All messages appear in order
- Each has unique ID
- List auto-scrolls to show latest message
- No duplicate messages

---

#### Test 5: Navigate Away and Back
**Steps**:
1. While in a chat, tap back button
2. Select the same fund again

**Expected Result**:
- Previously sent messages are still visible
- Message order is maintained
- No message duplication

**Console Logs to Expect**:
```
[Chat getMessages] Success: Found 3 messages
```

---

#### Test 6: Switch Between Funds
**Steps**:
1. Open Fund A chat
2. Send "Message in A"
3. Go back
4. Open Fund B chat
5. Send "Message in B"
6. Go back to Fund A

**Expected Result**:
- Fund A shows only messages sent to A
- Fund B shows only messages sent to B
- Messages don't mix between funds
- Each fund maintains its own conversation

---

### ⚠️ Error Handling Tests

#### Test 7: Network Error Simulation
**Steps**:
1. Open chat
2. Turn off network (airplane mode)
3. Try to send a message
4. Turn network back on

**Expected Result**:
- Message appears (optimistic)
- After retry fails, message disappears
- Error logged in console
- No app crash

**Console Logs to Expect**:
```
[ChatTab] Error sending message: <error details>
[tRPC Client] Fetch failed: <network error>
```

---

#### Test 8: Invalid Data Handling
**Steps**:
1. Try to send empty message (shouldn't be possible)
2. Try to send very long message (500+ chars)

**Expected Result**:
- Empty message: Send button is disabled
- Long message: Truncated to 500 chars

---

### 🎯 Performance Tests

#### Test 9: Rapid Message Sending
**Steps**:
1. Send 10 messages rapidly (as fast as possible)

**Expected Result**:
- All messages appear
- No message loss
- UI remains responsive
- Messages appear in sent order

---

#### Test 10: Message List Performance
**Steps**:
1. Send 50+ messages
2. Scroll through message list

**Expected Result**:
- Smooth scrolling (60 FPS)
- No jank or stuttering
- Messages load efficiently

---

## 🐛 Debugging Failed Tests

### If you see "JSON Parse error"
**Cause**: Backend not reachable or returning HTML
**Check**:
1. `EXPO_PUBLIC_RORK_API_BASE_URL` is set correctly
2. Backend server is running
3. Network connection is active

**Solution**:
```bash
# Check environment variable
echo $EXPO_PUBLIC_RORK_API_BASE_URL

# Restart backend if needed
```

---

### If you see "404 Not Found"
**Cause**: Route not registered correctly
**Check**:
1. `backend/trpc/app-router.ts` has chat routes
2. Routes are exported correctly
3. Hono server is using correct path

**Solution**:
- Verify all files from CHAT_APP_FIX_COMPLETE.md are updated
- Restart the app

---

### If messages don't appear
**Cause**: Data not syncing correctly
**Check**:
1. Console for errors
2. `currentListId` and `currentUserId` are set
3. `goalId` is valid

**Debug Commands**:
```javascript
// Add to ChatTab temporarily:
console.log('Debug:', { 
  currentListId, 
  currentUserId, 
  goalId,
  messagesFromServer 
});
```

---

### If duplicate messages appear
**Cause**: Optimistic update not filtering correctly
**Check**:
1. Message IDs are unique
2. Temp messages are filtered after real messages arrive
3. No multiple refetch calls

---

## 📊 Success Metrics

After all tests, verify:
- ✅ 100% of basic functionality tests pass
- ✅ 100% of error handling tests pass gracefully
- ✅ 80%+ of performance tests meet criteria
- ✅ No console errors during normal operation
- ✅ Smooth 60 FPS scrolling
- ✅ < 500ms message send latency

---

## 🎓 Testing Best Practices

### Manual Testing Tips
1. **Clear console** before each test
2. **Take screenshots** of failures
3. **Note exact steps** to reproduce issues
4. **Test on both iOS and Android** (if possible)
5. **Test on real device** not just simulator

### Automated Testing (Future)
Consider adding:
- Jest unit tests for ChatMessageStore
- React Testing Library tests for ChatTab
- E2E tests with Detox or Maestro
- Performance monitoring with Flipper

---

## 📝 Test Report Template

```markdown
## Test Session Report

**Date**: [DATE]
**Tester**: [NAME]
**Platform**: iOS/Android/Web
**Device**: [DEVICE INFO]

### Test Results
- Basic Functionality: [X/6] passed
- Error Handling: [X/2] passed
- Performance: [X/2] passed

### Issues Found
1. [Issue description]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

### Console Errors
[Paste relevant console errors]

### Screenshots
[Attach screenshots of issues]
```

---

## ✅ Final Verification

Before considering testing complete:
1. All 10 tests pass
2. No console errors (warnings OK)
3. Smooth performance
4. Messages persist correctly
5. Error handling works gracefully

**If all verified**: Chat app is production-ready! 🎉

---

**Last Updated**: See CHAT_APP_FIX_COMPLETE.md for implementation details.
