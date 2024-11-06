import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            name: "buckets",
            fileName: () => "index.js",
            formats: ["es"],
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
    },
});
