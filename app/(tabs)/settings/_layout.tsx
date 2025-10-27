import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="list-settings"
        options={{
          headerShown: true,
          title: 'List Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: true,
          title: 'Categories',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="teams"
        options={{
          headerShown: true,
          title: 'Team Members',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Profile',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
