import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider, PortalHost } from "@gorhom/portal";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { JokerPromptModal } from "@/components/JokerPromptModal";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import { httpLink } from "@trpc/client";
import superjson from "superjson";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
  return 'http://localhost:8081';
};

function RootLayoutNav() {
  const router = useRouter();
  const { 
    jokerModalVisible, 
    pendingFailedTask, 
    handleUseJoker, 
    handlePayStake,
    currentList,
    currentUser
  } = useApp();

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notification] Received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notification] Response:', response);
      const taskId = response.notification.request.content.data?.taskId as string | undefined;
      if (taskId) {
        router.push(`/task-detail?id=${taskId}`);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router]);

  const currencySymbol = currentList?.currencySymbol || '€';

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="join" 
          options={{ 
            presentation: "modal",
            headerShown: false 
          }} 
        />
        <Stack.Screen
          name="modal-demo"
          options={{
            presentation: "modal",
            headerShown: false
          }}
        />
      </Stack>
      <JokerPromptModal
        visible={jokerModalVisible}
        onUseJoker={handleUseJoker}
        onPayStake={handlePayStake}
        jokerCount={currentUser?.jokerCount || 0}
        stakeAmount={pendingFailedTask?.stake || 0}
        currencySymbol={currencySymbol}
      />
    </>
  );
}

export default function RootLayout() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          fetch(url, options) {
            console.log('[tRPC] Fetching:', url);
            return fetch(url, options).then(async (res) => {
              console.log('[tRPC] Response status:', res.status, res.statusText);
              if (!res.ok) {
                const text = await res.text();
                console.error('[tRPC] Error response body:', text);
              }
              return res;
            });
          },
        }),
      ],
    })
  );

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
              <PortalProvider>
                <DebugErrorBoundary>
                  <RootLayoutNav />
                </DebugErrorBoundary>
                <PortalHost name="modal-input-wrapper" />
              </PortalProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
