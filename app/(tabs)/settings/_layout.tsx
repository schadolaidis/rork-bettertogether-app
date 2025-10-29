import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function SettingsLayout() {
  const { t } = useApp();
  
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
          title: t.listSettings.title,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: true,
          title: t.categories.title,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="teams"
        options={{
          headerShown: true,
          title: t.teams.title,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: t.profile.title,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
