import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/salary-tracker/",
  server: {
    open: true, // Tự động mở trình duyệt mặc định khi chạy lệnh dev
  },
});
