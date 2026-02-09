import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./src/tests/setupTests.ts"],
		globals: true,
		include: ["src/**/*.{test,int.test}.{ts,tsx}"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});

