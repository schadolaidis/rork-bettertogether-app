import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return '';
  }

  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('[tRPC] Using configured base URL:', baseUrl);
    return baseUrl;
  }

  console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
  return 'http://localhost:8081';
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log('[tRPC Client] Request:', url);
        
        try {
          const response = await fetch(url, options);
          console.log('[tRPC Client] Response:', response.status, response.statusText);
          
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            const isHtml = contentType?.includes('text/html');
            
            if (isHtml) {
              console.error('[tRPC Client] ERROR: Received HTML instead of JSON (404/502)');
              throw new TRPCClientError('Backend server not reachable. Got HTML response instead of JSON.');
            }
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC Client] Fetch failed:', error);
          throw error;
        }
      },
    }),
  ],
});
