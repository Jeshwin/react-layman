import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
    // Set the root to the demo folder
    root: "./demo",
    plugins: [react()],
    base: "/react-layman/",
});
