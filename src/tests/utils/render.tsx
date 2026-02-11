import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import { TestProviders, createTestQueryClient } from "@/tests/utils/TestProviders";

/** Options for renderWithProviders (RTL render options plus optional queryClient). */
interface RenderWithProvidersOptions extends Omit<RenderOptions, "queries"> {
	/** Optional QueryClient; a new test client is created if not provided. */
	queryClient?: QueryClient;
}

/**
 * Renders the given UI with TestProviders (Mantine + QueryClient + Notifications).
 * Returns the React Testing Library result plus the queryClient for assertions or prefetching.
 *
 * @param ui - The React element to render (e.g. a page or feature component).
 * @param options - Optional render options and/or a custom queryClient.
 * @returns RTL render result plus queryClient.
 */
export function renderWithProviders(
	ui: ReactElement,
	options: RenderWithProvidersOptions = {},
) {
	const { queryClient: providedClient, ...renderOptions } = options;
	const queryClient = providedClient ?? createTestQueryClient();

	const result = render(
		<TestProviders queryClient={queryClient}>{ui}</TestProviders>,
		renderOptions,
	);

	return {
		...result,
		queryClient,
	};
}

