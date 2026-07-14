import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function normalizeSiteUrl(value) {
  return String(value || "http://localhost:5173").replace(/\/+$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = normalizeSiteUrl(
    process.env.VITE_SITE_URL ||
      process.env.URL ||
      env.VITE_SITE_URL ||
      "http://localhost:5173",
  );

  return {
    base: "/",
    plugins: [
      react(),
      {
        name: "inject-site-url",
        transformIndexHtml(html) {
          return html.replaceAll("__SITE_URL__", siteUrl);
        },
      },
    ],
  };
});
