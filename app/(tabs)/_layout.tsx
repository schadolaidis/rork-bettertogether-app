import { Tabs } from "expo-router";
import { LayoutDashboard, Calendar, CheckSquare, Target, Settings, MessageCircle } from "lucide-react-native";
import React from "react";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getToken } from "@/constants/token";

export default function TabLayout() {
  const { t } = useApp();
  const themeContext = useTheme();
  const theme = themeContext?.theme ?? null;
  
  if (!theme) {
    console.warn('[Theme] Missing ThemeProvider: using fallbacks in TabLayout');
  }
  
  const primary = getToken(theme, 'primary', '#2563EB');
  const textLow = getToken(theme, 'textLow', '#64748B');
  const surface = getToken(theme, 'surface', '#FFFFFF');
  const border = getToken(theme, 'border', '#CBD5E1');
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: textLow,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: surface,
          borderTopColor: border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.dashboard,
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.tabs.calendar,
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t.tabs.tasks,
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="funds"
        options={{
          title: t.tabs.fundGoals,
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t.tabs.chat,
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
