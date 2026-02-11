import "@testing-library/jest-dom/vitest";
import "whatwg-fetch";
import { vi } from "vitest";

// Mantine Select/Menu use ScrollArea; floating-ui uses ResizeObserver. jsdom does not provide it.
class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mantine uses window.matchMedia for color scheme; jsdom does not provide it.
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Ensure feed server actions are mocked with an in-memory implementation
// for all tests by default. Individual tests can override behavior via
// mockImplementationOnce / mockReset on the exported mocks.
import "@/tests/mocks/feedActions.mock";

// Re-export common helpers so tests can import from "@/tests/setupTests" if desired.
export * from "@testing-library/react";

