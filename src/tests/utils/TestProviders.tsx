import type { ReactNode } from "react";
import { MantineProvider, type MantineProviderProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
	QueryClient,
	QueryClientProvider,
	type DefaultOptions,
} from "@tanstack/react-query";
import { theme } from "@/lib/constants/theme";

/**
 * Creates a QueryClient configured for tests (no retries, no refetch on focus).
 * Use this when you need a fresh client per test or to pass into TestProviders/renderWithProviders.
 *
 * @param defaultOptions - Optional TanStack Query default options to merge with test defaults.
 * @returns A new QueryClient instance.
 */
export function createTestQueryClient(
	defaultOptions?: DefaultOptions,
): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				refetchOnWindowFocus: false,
				...defaultOptions?.queries,
			},
			mutations: {
				...defaultOptions?.mutations,
			},
		},
	});
}

/** Props for the TestProviders wrapper. */
interface TestProvidersProps {
	/** React tree to wrap with Mantine + QueryClient + Notifications. */
	children: ReactNode;
	/** Optional QueryClient; a new one is created if not provided. */
	queryClient?: QueryClient;
	/** Optional MantineProvider props (e.g. theme overrides). */
	mantineProps?: Partial<MantineProviderProps>;
}

/**
 * Wraps children with QueryClientProvider, MantineProvider (app theme), and Notifications.
 * Use for integration tests that need the same provider stack as the app.
 *
 * @param props - children, optional queryClient, optional mantineProps.
 */
export function TestProviders({
	children,
	queryClient,
	mantineProps,
}: TestProvidersProps) {
	const client = queryClient ?? createTestQueryClient();

	return (
		<QueryClientProvider client={client}>
			<MantineProvider theme={theme} defaultColorScheme="light" {...mantineProps}>
				<Notifications />
				{children}
			</MantineProvider>
		</QueryClientProvider>
	);
}

