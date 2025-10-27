// tRPC client configuration for React
// Handles client-side API calls with React Query integration

"use client";

import type { AppRouter } from "@/server/routers/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React, { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
	if (typeof window !== "undefined") return "";
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	const trpcClient = React.useMemo(() => {
		return trpc.createClient({
		  links: [
			httpBatchLink({
			  url: "/api/trpc",
			  transformer: superjson,
			  fetch(url: RequestInfo | URL, options?: RequestInit) {
				return fetch(url, {
				  ...options,
				  credentials: "include",
				});
			  },
			}),
		  ],
		});
	  }, []);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</trpc.Provider>
	);
}