import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('[tRPC] Using configured base URL:', baseUrl);
    return baseUrl;
  }

  console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
  console.warn('[tRPC] Available env vars:', Object.keys(process.env).filter(k => k.includes('RORK') || k.includes('EXPO')));
  return 'http://localhost:8081';
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log('[tRPC Client] Fetching:', url);
        const response = await fetch(url, options);
        console.log('[tRPC Client] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const cloned = response.clone();
          const text = await cloned.text();
          console.error('[tRPC Client] Error response body:', text);
        }
        
        return response;
      },
    }),
  ],
});
