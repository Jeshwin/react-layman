import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import {libInjectCss} from "vite-plugin-lib-inject-css";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ["src"],
            outDir: "lib",
        }),
        libInjectCss(),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "lodash",
                "react-dnd",
                "react-dnd-html5-backend",
                /^react-icons\//,
                "uuid",
            ],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
        outDir: "lib",
        // Ensure CSS is emitted
        cssCodeSplit: true,
        copyPublicDir: false,
    },
});
