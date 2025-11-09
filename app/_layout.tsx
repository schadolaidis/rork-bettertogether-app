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
import { httpLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { Platform } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return '';
  }

  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('[tRPC _layout] Using configured base URL:', baseUrl);
    return baseUrl;
  }
  
  console.warn('[tRPC _layout] EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
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
          async fetch(url, options) {
            console.log('[tRPC Provider] Request:', url);
            
            try {
              const response = await fetch(url, options);
              console.log('[tRPC Provider] Response:', response.status, response.statusText);
              
              if (!response.ok) {
                const contentType = response.headers.get('content-type');
                const isHtml = contentType?.includes('text/html');
                
                if (isHtml) {
                  console.error('[tRPC Provider] ERROR: Received HTML instead of JSON (404/502)');
                  throw new TRPCClientError('Backend server not reachable. Got HTML response instead of JSON.');
                }
              }
              
              return response;
            } catch (error) {
              console.error('[tRPC Provider] Fetch failed:', error);
              throw error;
            }
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
