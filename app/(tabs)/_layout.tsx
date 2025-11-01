import { withLayoutContext } from "expo-router";
import React from "react";
import { useApp } from "@/contexts/AppContext";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import { Platform } from "react-native";

const { Navigator } = createNativeBottomTabNavigator();

const Tabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const { t } = useApp();
  
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.dashboard,
          tabBarIcon: Platform.OS === "ios" 
            ? { sfSymbol: "house.fill" }
            : { uri: "https://img.icons8.com/fluency-systems-filled/48/3B82F6/home.png" },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.tabs.calendar,
          tabBarIcon: Platform.OS === "ios" 
            ? { sfSymbol: "calendar" }
            : { uri: "https://img.icons8.com/fluency-systems-filled/48/3B82F6/calendar.png" },
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t.tabs.tasks,
          tabBarIcon: Platform.OS === "ios" 
            ? { sfSymbol: "checkmark.square.fill" }
            : { uri: "https://img.icons8.com/fluency-systems-filled/48/3B82F6/checked-checkbox.png" },
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          title: t.tabs.fundGoals,
          tabBarIcon: Platform.OS === "ios" 
            ? { sfSymbol: "target" }
            : { uri: "https://img.icons8.com/fluency-systems-filled/48/3B82F6/target.png" },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: Platform.OS === "ios" 
            ? { sfSymbol: "gearshape.fill" }
            : { uri: "https://img.icons8.com/fluency-systems-filled/48/3B82F6/settings.png" },
        }}
      />
    </Tabs>
  );
}
