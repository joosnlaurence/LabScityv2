import "@testing-library/jest-dom/vitest";
import "whatwg-fetch";

// Ensure feed server actions are mocked with an in-memory implementation
// for all tests by default. Individual tests can override behavior via
// mockImplementationOnce / mockReset on the exported mocks.
import "@/tests/mocks/feedActions.mock";

// Re-export common helpers so tests can import from "@/tests/setupTests" if desired.
export * from "@testing-library/react";

